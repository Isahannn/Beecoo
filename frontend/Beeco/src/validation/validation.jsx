import { z } from 'zod';

export const validationSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
    .regex(/[a-z]/, 'Должна быть хотя бы одна строчная буква')
    .regex(/[0-9]/, 'Должна быть хотя бы одна цифра'),
  confirm_password: z.string(),
  first_name: z.string().min(1, 'Имя обязательно'),
  last_name: z.string().min(1, 'Фамилия обязательна'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Пароли не совпадают',
  path: ['confirm_password'],
});
