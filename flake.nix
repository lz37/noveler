{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    # search from nixhub
    nixpkgs-for-nodejs.url = "github:NixOS/nixpkgs/aa9461550594533c29866d42f861b6ff079a7fb6"; # 20.14.0
  };

  nixConfig = {
    extra-substituters = [
      "https://nix-community.cachix.org"
      "https://devenv.cachix.org"
    ];
    extra-trusted-public-keys = [
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw="
    ];
  };

  outputs = { self, nixpkgs, devenv, systems, nixpkgs-for-nodejs, ... } @ inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      packages = forEachSystem (system: {
        devenv-up = self.devShells.${system}.default.config.procfileScript;
      });
      devShells = forEachSystem
        (system:
          let
            pkgs = import nixpkgs {
              inherit system;
              config.allowUnfree = true;
              overlays = [
                (final: prev: {
                  nodejs = nixpkgs-for-nodejs.legacyPackages.${system}.nodejs;
                  nodejs-slim = nixpkgs-for-nodejs.legacyPackages.${system}.nodejs-slim;
                })
              ];
            };
          in
          {
            default = devenv.lib.mkShell {
              inherit inputs pkgs;
              modules = [
                {
                  # https://devenv.sh/reference/options/
                  languages = {
                    javascript = {
                      enable = true;
                      package = pkgs.nodejs-slim;
                      corepack.enable = true;
                    };
                    nix = {
                      enable = true;
                      lsp.package = pkgs.nil;
                    };
                  };
                  packages = with pkgs;[
                    nil
                    shfmt
                    nixpkgs-fmt
                  ];
                }
              ];
            };
          });
    };
}
