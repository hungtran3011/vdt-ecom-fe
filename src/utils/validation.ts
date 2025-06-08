/**
 * Comprehensive validation utility for forms and data validation
 * Used across stock, payment, and order management components
 */

// Base validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  validate: (value: T) => string | null;
  message?: string;
}

// Common validation rules
export const ValidationRules = {
  required: <T>(value: T): string | null => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return 'This field is required';
    }
    return null;
  },

  positiveNumber: (value: number): string | null => {
    if (isNaN(value) || value <= 0) {
      return 'Must be a positive number';
    }
    return null;
  },

  nonNegativeNumber: (value: number): string | null => {
    if (isNaN(value) || value < 0) {
      return 'Must be zero or positive';
    }
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (!value || value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },

  currency: (value: number): string | null => {
    if (isNaN(value) || value < 0 || value > 999999999.99) {
      return 'Invalid currency amount';
    }
    return null;
  },

  percentage: (value: number): string | null => {
    if (isNaN(value) || value < 0 || value > 100) {
      return 'Must be between 0 and 100';
    }
    return null;
  },

  stockQuantity: (value: number): string | null => {
    if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
      return 'Must be a non-negative integer';
    }
    return null;
  }
};

// Validation utility class
export class Validator<T> {
  private rules: Array<ValidationRule<T>> = [];

  add(rule: (value: T) => string | null, message?: string): Validator<T> {
    this.rules.push({ validate: rule, message });
    return this;
  }

  required(message?: string): Validator<T> {
    return this.add(ValidationRules.required, message || 'This field is required');
  }

  validate(value: T): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const error = rule.validate(value);
      if (error) {
        errors.push(rule.message || error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Specific validators for our domain objects
export const StockValidators = {
  stockItem: {
    productId: new Validator<string>().required(),
    productName: new Validator<string>().required().add(ValidationRules.minLength(2)),
    quantity: new Validator<number>().required().add(ValidationRules.stockQuantity),
    unitPrice: new Validator<number>().required().add(ValidationRules.currency),
    lowStockThreshold: new Validator<number>().required().add(ValidationRules.nonNegativeNumber),
    location: new Validator<string>().add(ValidationRules.maxLength(100))
  },
  
  stockMovement: {
    productId: new Validator<string>().required(),
    type: new Validator<string>().required(),
    quantity: new Validator<number>().required().add(ValidationRules.positiveNumber),
    reason: new Validator<string>().required().add(ValidationRules.minLength(3)),
    notes: new Validator<string>().add(ValidationRules.maxLength(500))
  }
};

export const PaymentValidators = {
  payment: {
    orderId: new Validator<string>().required(),
    amount: new Validator<number>().required().add(ValidationRules.currency),
    method: new Validator<string>().required(),
    description: new Validator<string>().add(ValidationRules.maxLength(500))
  },

  refund: {
    paymentId: new Validator<string>().required(),
    amount: new Validator<number>().required().add(ValidationRules.currency),
    reason: new Validator<string>().required().add(ValidationRules.minLength(10)),
    notes: new Validator<string>().add(ValidationRules.maxLength(500))
  }
};

export const OrderValidators = {
  order: {
    customerEmail: new Validator<string>().required().add(ValidationRules.email),
    shippingAddress: new Validator<string>().required().add(ValidationRules.minLength(10)),
    items: new Validator<unknown[]>().required().add((items) => 
      items.length === 0 ? 'Order must have at least one item' : null
    )
  },

  statusUpdate: {
    status: new Validator<string>().required(),
    notes: new Validator<string>().add(ValidationRules.maxLength(500))
  }
};

// Form validation helper with flexible validator types
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  validators: Record<keyof T, Validator<unknown>>
): { isValid: boolean; errors: Record<keyof T, string[]> } {
  const errors = {} as Record<keyof T, string[]>;
  let isValid = true;

  for (const [field, validator] of Object.entries(validators)) {
    const fieldKey = field as keyof T;
    const result = validator.validate(data[fieldKey]);
    if (!result.isValid) {
      errors[fieldKey] = result.errors;
      isValid = false;
    }
  }

  return { isValid, errors };
}

// Helper to cast typed validators for validateForm compatibility
export function asValidator<T>(validator: Validator<T>): Validator<unknown> {
  return validator as unknown as Validator<unknown>;
}

// Error formatting utilities
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
    .join('; ');
}

export function getFirstError(errors: Record<string, string[]>): string | null {
  for (const fieldErrors of Object.values(errors)) {
    if (fieldErrors.length > 0) {
      return fieldErrors[0];
    }
  }
  return null;
}

// API error handling utilities
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
}

export function isApiError(error: unknown): error is ApiErrorResponse {
  return error !== null && typeof error === 'object' && 'code' in error && 'message' in error;
}

export function formatApiError(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const errorWithResponse = error as { response?: { data?: { message?: string } } };
    if (errorWithResponse.response?.data?.message) {
      return errorWithResponse.response.data.message;
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: string };
    return errorWithMessage.message;
  }
  
  return 'An unexpected error occurred';
}

// Status validation for business rules
export const StatusTransitions = {
  order: {
    PENDING_PAYMENT: ['PAID', 'CANCELLED', 'PAYMENT_FAILED'],
    PAID: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    PAYMENT_FAILED: ['PENDING_PAYMENT']
  },
  
  payment: {
    PENDING: ['COMPLETED', 'FAILED', 'CANCELLED'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    COMPLETED: ['REFUNDED'],
    FAILED: ['PENDING'],
    CANCELLED: [],
    REFUNDED: []
  }
};

export function validateStatusTransition(
  currentStatus: string,
  newStatus: string,
  entityType: 'order' | 'payment'
): { isValid: boolean; error?: string } {
  const transitions = StatusTransitions[entityType];
  const allowedTransitions = transitions[currentStatus as keyof typeof transitions] as string[] | undefined;
  
  if (!allowedTransitions) {
    return {
      isValid: false,
      error: `Invalid current status: ${currentStatus}`
    };
  }
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`
    };
  }
  
  return { isValid: true };
}
