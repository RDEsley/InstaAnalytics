import { z } from 'zod';

// Instagram username validation schema
export const usernameSchema = z.string()
  .regex(
    /^@?[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/,
    'Invalid Instagram handle format'
  )
  .transform(value => {
    // Remove @ symbol if present
    return value.startsWith('@') ? value.substring(1) : value;
  });

// Form validation schema
export const formSchema = z.object({
  username: usernameSchema,
});

// API request validation schema
export const apiRequestSchema = z.object({
  username: usernameSchema,
});

// Sanitize and validate Instagram handle
export const sanitizeUsername = (input: string): string => {
  // Remove @ if present
  let username = input.startsWith('@') ? input.substring(1) : input;
  
  // Remove any spaces
  username = username.trim();
  
  // Convert to lowercase
  username = username.toLowerCase();
  
  return username;
};

// Validate API response from Apify
export function validateApifyResponse(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;

  // 1) Procura o objeto "perfil" via ownerUsername
  const profileItem = data.find((item) => typeof item.ownerUsername === 'string');
  if (!profileItem) {
    // não encontrou nenhum objeto com ownerUsername
    return false;
  }
  // Como perfilItem existe, validamos ao menos esse campo:
  if (
    typeof profileItem.ownerUsername !== 'string' ||
    typeof profileItem.ownerFullName !== 'string'
  ) {
    return false;
  }

  // 2) Procura pelo menos um post no array que satisfaça as condições mínimas:
  const hasAtLeastOnePost = data.some((item) => {
    return (
      typeof item.id === 'string' &&
      typeof item.displayUrl === 'string'
      // Se quiser checar algo extra (por exemplo, likesCount existindo, mesmo que seja null),
      // você pode checar typeof item.likesCount === 'number' ou 'string' etc.
    );
  });

  if (!hasAtLeastOnePost) {
    return false;
  }

  return true;
}