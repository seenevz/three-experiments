import type { UserConfig } from "vite";
import mpa from "vite-plugin-mpa";

export default <UserConfig>{
  plugins: [mpa({ scanDir: "src/**/*" })],
};
