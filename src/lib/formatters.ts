// Utilitários de formatação e validação

export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatPhone = (phone: string): string => {
  // Remove tudo que não for número
  const numbers = phone.replace(/\D/g, '')
  
  // Aplica a máscara (XX) XXXXX-XXXX
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }
}

export const formatCPF = (cpf: string): string => {
  // Remove tudo que não for número
  const numbers = cpf.replace(/\D/g, '')
  
  // Aplica a máscara XXX.XXX.XXX-XX
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
}

export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '')
  return numbers.length >= 10 && numbers.length <= 11
}

export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false
  
  // Validação do algoritmo do CPF
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i)
  }
  let digit1 = 11 - (sum % 11)
  if (digit1 > 9) digit1 = 0
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i)
  }
  let digit2 = 11 - (sum % 11)
  if (digit2 > 9) digit2 = 0
  
  return parseInt(numbers.charAt(9)) === digit1 && parseInt(numbers.charAt(10)) === digit2
}