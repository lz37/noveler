{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";
    # search from nixhub
    nixpkgs-nodejs.url = "github:NixOS/nixpkgs/a9858885e197f984d92d7fe64e9fff6b2e488d40"; # 22.2.0
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

  outputs =
    {
      self,
      nixpkgs,
      devenv,
      systems,
      nixpkgs-nodejs,
      ...
    }@inputs:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      packages = forEachSystem (system: {
        devenv-up = self.devShells.${system}.default.config.procfileScript;
      });
      devShells = forEachSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config.allowUnfree = true;
            overlays = [
              (final: prev: {
                nodejs_22 = nixpkgs-nodejs.legacyPackages.${system}.nodejs_22;
                nodejs-slim_22 = nixpkgs-nodejs.legacyPackages.${system}.nodejs-slim_22;
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
                env = {
                  COREPACK_INTEGRITY_KEYS = "0";
                };
                languages = {
                  javascript = {
                    enable = true;
                    package = pkgs.nodejs_22;
                    corepack.enable = true;
                  };
                  nix = {
                    enable = true;
                    lsp.package = pkgs.nil;
                  };
                };
                services = {
                };
                packages = with pkgs; [
                  nil
                  shfmt
                  nixfmt-rfc-style
                  cz-cli
                ];
              }
            ];
          };
        }
      );
    };
}
