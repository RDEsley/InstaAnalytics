import { z } from 'zod';

// Instagram username validation schema
export const usernameSchema = z.string()
  .regex(
    /^@?[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/,
    'Formato de usuário do Instagram inválido'
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

// Validate API response from Apify Instagram Profile Scraper
export function validateApifyResponse(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Dados vazios ou formato inválido do Apify');
    return false;
  }

  // Procura por dados do perfil no formato do Instagram Profile Scraper
  const profileData = data.find((item) => 
    item.username && 
    typeof item.followersCount !== 'undefined' &&
    typeof item.followingCount !== 'undefined'
  );

  if (!profileData) {
    console.error('Dados do perfil não encontrados na resposta do Apify');
    return false;
  }

  // Validações básicas dos campos obrigatórios
  if (typeof profileData.username !== 'string') {
    console.error('Username inválido nos dados do perfil');
    return false;
  }

  console.log('→ Validação bem-sucedida dos dados do Apify');
  return true;
}