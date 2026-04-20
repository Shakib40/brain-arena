import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTheme: 'glassmorphism', // Default theme
  themes: [
    {
      id: 'glassmorphism',
      name: 'Frosted Blur',
      style: 'Glassmorphism',
      vibe: 'Frosted blur panels',
      colors: 'Purple-pink gradient backdrop'
    },
    {
      id: 'midnight-ink',
      name: 'Bold Contrast',
      style: 'Midnight Ink',
      vibe: 'Pure contrast, no color',
      colors: 'Black + crisp white tiles'
    },
    {
      id: 'aurora',
      name: 'Gradient Mesh',
      style: 'Aurora',
      vibe: 'Gradient mesh + glow',
      colors: 'Deep teal with green/purple accents'
    },
    {
      id: 'clay-ui',
      name: 'Neumorphic Soft',
      style: 'Clay UI',
      vibe: 'Neumorphic soft shadows',
      colors: 'Soft gray with 3D tile depth'
    },
    {
      id: 'neon-noir',
      name: 'Dark - Vivid',
      style: 'Neon Noir',
      vibe: 'Dark + electric accents',
      colors: 'Near-black with indigo/pink glow'
    },
    {
      id: 'sand-stone',
      name: 'Earthy Minimal',
      style: 'Sand Stone',
      vibe: 'Earthy minimal',
      colors: 'Warm off-white with natural tones'
    }
  ]
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
    }
  }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
