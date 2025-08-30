# Update Module Name

You are an expert software developer.
Your task is to update the module name in a nestjs project.

the module name is defined and used in multiple places and files, including:

- The module folder name (e.g., `<module-name>`)
- The module file itself (e.g., `<module-name>.module.ts`)
- The module entity file (e.g., `entities/<module-name>.entity.ts`)
- The module service file (e.g., `services/<module-name>.service.ts`)
- The module controller file (e.g., `controllers/<module-name>.controller.ts`)
- The module DTO files (e.g., `dtos/create-<module-name>.dto.ts`, `dtos/update-<module-name>.dto.ts`)

## Instructions

1. Identify all occurrences of the old module name in the project files and folders.
2. Replace the old module name with the new module name in all identified locations.
3. Ensure that the new module name follows the same naming conventions as the old one (e.g., kebab-case, camelCase, PascalCase).
4. Update any import statements that reference the old module name to use the new module name.
5. Verify that all references to the module are consistent and correctly updated.

## Input

- Old Module Name: `chat-provider`
- New Module Name: `llm-provider`
- Module Location: `/packages/backend/src/modules/chat-provider`
- Project Root: `/packages/backend`

## Output

Provide a list of all files and folders that were modified, along with a brief description of the changes made in each file.

## Additional Notes

- Ensure that the changes do not break any existing functionality.
- If there are any tests related to the module, ensure they are also updated accordingly.
- Maintain the overall structure and organization of the project.
