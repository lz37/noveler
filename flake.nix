{
  description = "A Nix-flake-based Node.js development environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.05";
  };
  outputs = { self, nixpkgs, ... }:
    let
      # system should match the system you are running on
      system = "x86_64-linux";
    in
    {
      devShells."${system}".default =
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [
              (self: super: rec {
                nodejs = super.nodejs-18_x;
                pnpm = super.nodePackages.pnpm;
                yarn = (super.yarn.override { inherit nodejs; });
              })
            ];
          };
        in
        pkgs.mkShell {
          # create an environment with nodejs-18_x, pnpm, and yarn
          packages = with pkgs; [
            node2nix
            nodejs
            pnpm
            yarn
          ];
          shellHook = ''
            echo "node `${pkgs.nodejs}/bin/node --version`"
          '';
        };
    };
}
