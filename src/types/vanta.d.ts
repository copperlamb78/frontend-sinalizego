declare module 'vanta/dist/vanta.fog.min' {
  const FOG: (options: Record<string, unknown>) => {
    destroy: () => void;
    setOptions: (options: Record<string, unknown>) => void;
    resize: () => void;
  };
  export default FOG;
}
