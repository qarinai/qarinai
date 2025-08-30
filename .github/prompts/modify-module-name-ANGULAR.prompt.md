# Update Module Name

You are an expert software developer.
Your task is to update the module name in an angular project.

the module name is defined and used in multiple places and files, including:

- The module folder name (e.g., `<module-name>`)
- The module routes file (e.g., `<module-name>.routes.ts`)
- The module components folder (e.g., `add/add-<module-name>.component.ts`)
- Services related to the module (e.g., `_services/<module-name>.service.ts`)
- Interfaces related to the module (e.g., `_interfaces/<module-name>.interface.ts`)

## Instructions

1. Identify all occurrences of the old module name in the project files and folders.
2. Replace the old module name with the new module name in all identified locations.
3. Ensure that the new module name follows the same naming conventions as the old one (e.g., kebab-case, camelCase, PascalCase).
4. Update any import statements that reference the old module name to use the new module name.
5. Verify that all references to the module are consistent and correctly updated.

## Input

- Old Module Name: `chat-provider`
- New Module Name: `llm-provider`
- Module Location: `/packages/frontend/src/app/pages/chat-providers`
- Project Root: `/packages/frontend`

## Output

Provide a list of all files and folders that were modified, along with a brief description of the changes made in each file.

## Additional Notes

- Ensure that the changes do not break any existing functionality.
- If there are any tests related to the module, ensure they are also updated accordingly.
- Maintain the overall structure and organization of the project.
