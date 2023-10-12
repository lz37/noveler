import { createGlobalStyle } from 'styled-components'

const styled = { createGlobalStyle }

export default styled.createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`
