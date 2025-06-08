---
applyTo: '**'
---

1. **Coding Styles**
    - Use consistent naming conventions for variables, functions, and classes.
    - Follow language-specific style guides (e.g., PEP 8 for Python, Google Java Style Guide).
    - Maintain a consistent indentation style (spaces vs. tabs).
    - Use meaningful comments to explain complex logic or decisions.
    - Keep lines of code within a reasonable length (e.g., 80-120 characters).
    - Avoid deep nesting of code blocks; refactor when necessary.
    - Use version control best practices, including meaningful commit messages.
    - For the TypeScript: do not use `any` type, prefer using `unknown` or specific types.
    - For any interface or type definition, separate them into their own files in the `src/types` directory.

2. **Material Design**
    - Follow the Material Design guidelines for UI/UX consistency. Use the components from here https://m3.material.io/components
    - Ensure that the design is responsive and accessible.
    - Use appropriate color schemes and typography as per Material Design standards. The variables are defined in the `src/app/globals.css`
    - Implement animations and transitions that enhance user experience without being distracting.
    - The Material Design Icons (filled and outlined only, add other styles later) are used with font-face, which can be 
    used in the ```html
    <span class="mdi">icon_name</span>
    <span class="mdi-filled">icon_name</span>
    ```

