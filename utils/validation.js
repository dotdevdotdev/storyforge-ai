export const characterValidation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  fullName: {
    firstName: {
      maxLength: 50,
    },
    lastName: {
      maxLength: 50,
    },
  },
  description: {
    maxLength: 1000,
  },
  appearance: {
    maxLength: 1000,
  },
  personality: {
    maxLength: 1000,
  },
  backstory: {
    maxLength: 2000,
  },
};
