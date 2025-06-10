# API Documentation - InstaAnalytics Authentication

## Overview

Esta documentação descreve os endpoints de autenticação da API do InstaAnalytics, incluindo login, registro e logout de usuários.

## Base URL

```
http://localhost:3000/api
```

## Authentication

A API utiliza JWT tokens para autenticação. Após o login bem-sucedido, inclua o token no header `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

Todos os endpoints possuem rate limiting para prevenir abuso:

- **Login**: 5 tentativas por minuto por IP
- **Registro**: 3 tentativas por minuto por IP
- **Análise**: 5 tentativas por minuto por IP

Headers de resposta incluem informações sobre rate limiting:
- `X-RateLimit-Limit`: Número máximo de requests permitidos
- `X-RateLimit-Remaining`: Requests restantes na janela atual
- `X-RateLimit-Reset`: Timestamp quando o limite será resetado

## Endpoints

### POST /api/auth/login

Autentica um usuário existente.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "rememberMe": false
}
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "full_name": "Nome do Usuário"
      },
      "created_at": "2024-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_at": 1234567890
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Error (401)**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email ou senha incorretos"
}
```

**Error (429)**
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Muitas tentativas de login. Tente novamente em alguns minutos.",
  "retryAfter": 60
}
```

### POST /api/auth/register

Registra um novo usuário.

#### Request Body

```json
{
  "fullName": "Nome Completo",
  "email": "user@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

#### Response

**Success (201)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "full_name": "Nome Completo"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Cadastro realizado com sucesso"
}
```

**Error (409)**
```json
{
  "success": false,
  "error": "User already exists",
  "message": "Este email já está cadastrado"
}
```

**Error (400)**
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Senhas não coincidem"
}
```

### POST /api/auth/logout

Faz logout do usuário atual.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

**Error (401)**
```json
{
  "success": false,
  "error": "No authorization token provided"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Credenciais inválidas |
| 405 | Method Not Allowed - Método HTTP não permitido |
| 409 | Conflict - Recurso já existe |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro interno do servidor |

## Security Features

### Password Requirements

- Mínimo 6 caracteres
- Máximo 100 caracteres
- Recomendado: combinação de letras maiúsculas, minúsculas, números e símbolos

### Rate Limiting

Implementado para prevenir ataques de força bruta:
- Limite por IP
- Janela deslizante de tempo
- Headers informativos

### Input Validation

- Sanitização de entrada
- Validação de formato de email
- Verificação de força da senha
- Proteção contra XSS

### Logging

Todos os eventos de segurança são logados:
- Tentativas de login (sucesso/falha)
- Registros de novos usuários
- Atividades suspeitas
- Violações de rate limit

## Examples

### Login com cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "userpassword"
  }'
```

### Registro com cURL

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "email": "joao@example.com",
    "password": "minhasenha123",
    "confirmPassword": "minhasenha123"
  }'
```

### Logout com cURL

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer your-jwt-token"
```

## Testing

Para testar os endpoints, você pode usar:

1. **Postman**: Importe a collection disponível em `/docs/postman-collection.json`
2. **cURL**: Use os exemplos fornecidos acima
3. **Frontend**: Use o formulário de login/registro da aplicação

## Support

Para suporte técnico ou dúvidas sobre a API, entre em contato:
- Email: richardesleyso@gmail.com
- GitHub: [RDEsley](https://github.com/RDEsley)