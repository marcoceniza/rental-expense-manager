/// <reference types="nativewind/types" />

// Side-effect CSS imports (e.g. `import '../../global.css'`) need an ambient
// type declaration. expo-env.d.ts (gitignored/generated) used to provide this.
declare module '*.css' {
  const css: string
  export default css
}
