import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Error Identification Tests (WCAG 3.3.1)
 * 
 * These tests verify that input errors are properly identified and described to users.
 * This ensures that users can understand what errors occurred and how to fix them.
 */

describe('Error Identification Tests (WCAG 3.3.1)', () => {
  // Test component with proper error identification
  const ProperErrorIdentificationForm = () => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    
    const validateForm = (e: React.FormEvent) => {
      e.preventDefault();
      
      const form = e.target as HTMLFormElement;
      const nameInput = form.elements.namedItem('name') as HTMLInputElement;
      const emailInput = form.elements.namedItem('email') as HTMLInputElement;
      const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
      
      const newErrors: Record<string, string> = {};
      
      if (!nameInput.value.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!emailInput.value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!passwordInput.value) {
        newErrors.password = 'Password is required';
      } else if (passwordInput.value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      setErrors(newErrors);
      setSubmitted(Object.keys(newErrors).length === 0);
    };
    
    return (
      <div>
        <form onSubmit={validateForm} noValidate>
          <div>
            <label htmlFor="name">Name:</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <div id="name-error" role="alert" className="error">
                {errors.name}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <div id="email-error" role="alert" className="error">
                {errors.email}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <div id="password-error" role="alert" className="error">
                {errors.password}
              </div>
            )}
          </div>
          
          <button type="submit">Submit</button>
        </form>
        
        {submitted && <div role="status">Form submitted successfully!</div>}
      </div>
    );
  };

  // Test component with improper error identification
  const ImproperErrorIdentificationForm = () => {
    const [errors, setErrors] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState(false);
    
    const validateForm = (e: React.FormEvent) => {
      e.preventDefault();
      
      const form = e.target as HTMLFormElement;
      const nameInput = form.elements.namedItem('name') as HTMLInputElement;
      const emailInput = form.elements.namedItem('email') as HTMLInputElement;
      const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
      
      const hasErrors = !nameInput.value.trim() || 
                        !emailInput.value.trim() || 
                        !/\S+@\S+\.\S+/.test(emailInput.value) ||
                        !passwordInput.value || 
                        passwordInput.value.length < 8;
      
      setErrors(hasErrors);
      setSubmitted(!hasErrors);
    };
    
    return (
      <div>
        <form onSubmit={validateForm} noValidate>
          <div>
            <label htmlFor="improper-name">Name:</label>
            <input type="text" id="improper-name" name="name" />
          </div>
          
          <div>
            <label htmlFor="improper-email">Email:</label>
            <input type="email" id="improper-email" name="email" />
          </div>
          
          <div>
            <label htmlFor="improper-password">Password:</label>
            <input type="password" id="improper-password" name="password" />
          </div>
          
          <button type="submit">Submit</button>
        </form>
        
        {errors && <div className="general-error">There are errors in the form.</div>}
        {submitted && <div>Form submitted successfully!</div>}
      </div>
    );
  };

  describe('Error Message Presence Tests', () => {
    test('form should display specific error messages for invalid fields', () => {
      render(<ProperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that error messages are displayed
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('should detect missing specific error messages', () => {
      render(<ImproperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that only a general error message is displayed
      expect(screen.getByText('There are errors in the form.')).toBeInTheDocument();
      
      // Check that specific error messages are not displayed
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    });
  });

  describe('Error Association Tests', () => {
    test('error messages should be associated with their respective form fields', () => {
      render(<ProperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that error messages are associated with their fields
      const nameInput = screen.getByLabelText('Name:');
      const emailInput = screen.getByLabelText('Email:');
      const passwordInput = screen.getByLabelText('Password:');
      
      // Check aria-invalid attribute
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      
      // Check aria-describedby attribute
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
      
      // Check that error message IDs match aria-describedby values
      expect(screen.getByText('Name is required')).toHaveAttribute('id', 'name-error');
      expect(screen.getByText('Email is required')).toHaveAttribute('id', 'email-error');
      expect(screen.getByText('Password is required')).toHaveAttribute('id', 'password-error');
    });

    test('should detect errors not associated with form fields', () => {
      render(<ImproperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that fields do not have aria-invalid or aria-describedby attributes
      const nameInput = screen.getByLabelText('Name:');
      const emailInput = screen.getByLabelText('Email:');
      const passwordInput = screen.getByLabelText('Password:');
      
      expect(nameInput).not.toHaveAttribute('aria-invalid');
      expect(emailInput).not.toHaveAttribute('aria-invalid');
      expect(passwordInput).not.toHaveAttribute('aria-invalid');
      
      expect(nameInput).not.toHaveAttribute('aria-describedby');
      expect(emailInput).not.toHaveAttribute('aria-describedby');
      expect(passwordInput).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Error Styling Tests', () => {
    test('error messages should be visually distinct', () => {
      render(<ProperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that error messages have the error class
      const errorMessages = screen.getAllByRole('alert');
      errorMessages.forEach(message => {
        expect(message).toHaveClass('error');
      });
    });
  });

  describe('Screen Reader Announcement Tests', () => {
    test('error messages should be announced to screen readers', () => {
      render(<ProperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that error messages have the role="alert" attribute
      const errorMessages = screen.getAllByText(/is required|is invalid/);
      errorMessages.forEach(message => {
        expect(message).toHaveAttribute('role', 'alert');
      });
    });

    test('should detect errors not announced to screen readers', () => {
      render(<ImproperErrorIdentificationForm />);
      
      // Submit the form without filling any fields
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      
      // Check that the general error message does not have role="alert"
      const generalError = screen.getByText('There are errors in the form.');
      expect(generalError).not.toHaveAttribute('role', 'alert');
    });
  });
});

// Mock form component with validation
const FormWithValidation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      valid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (isValid) {
      setSubmitted(true);
      // In a real app, you would submit the form data to a server
    }
  };
  
  return (
    <div>
      {submitted ? (
        <div role="alert" aria-live="assertive" data-testid="success-message">
          Form submitted successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              data-testid="name-input"
            />
            {errors.name && (
              <div 
                id="name-error" 
                role="alert" 
                className="error-message"
                data-testid="name-error"
              >
                {errors.name}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              data-testid="email-input"
            />
            {errors.email && (
              <div 
                id="email-error" 
                role="alert" 
                className="error-message"
                data-testid="email-error"
              >
                {errors.email}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              data-testid="password-input"
            />
            {errors.password && (
              <div 
                id="password-error" 
                role="alert" 
                className="error-message"
                data-testid="password-error"
              >
                {errors.password}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              data-testid="confirm-password-input"
            />
            {errors.confirmPassword && (
              <div 
                id="confirm-password-error" 
                role="alert" 
                className="error-message"
                data-testid="confirm-password-error"
              >
                {errors.confirmPassword}
              </div>
            )}
          </div>
          
          <button type="submit" data-testid="submit-button">Submit</button>
        </form>
      )}
    </div>
  );
};

describe('Error Identification Tests (WCAG 3.3.1)', () => {
  test('form errors are properly identified and displayed', async () => {
    render(<FormWithValidation />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that error messages are displayed
    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('password-error')).toBeInTheDocument();
    
    // Check that error messages have the correct text
    expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
  });
  
  test('error messages are associated with form fields using aria-describedby', async () => {
    render(<FormWithValidation />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that form fields have aria-describedby attributes
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
    
    // Check that error messages have matching IDs
    expect(screen.getByTestId('name-error')).toHaveAttribute('id', 'name-error');
    expect(screen.getByTestId('email-error')).toHaveAttribute('id', 'email-error');
    expect(screen.getByTestId('password-error')).toHaveAttribute('id', 'password-error');
  });
  
  test('form fields with errors have aria-invalid attribute', async () => {
    render(<FormWithValidation />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that form fields have aria-invalid="true"
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  });
  
  test('error messages have role="alert" for screen readers', async () => {
    render(<FormWithValidation />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that error messages have role="alert"
    expect(screen.getByTestId('name-error')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('email-error')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('password-error')).toHaveAttribute('role', 'alert');
  });
  
  test('error messages are cleared when user corrects the input', async () => {
    render(<FormWithValidation />);
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that error messages are displayed
    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    
    // Fix the name field
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    // Check that the name error message is cleared
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    
    // Check that the name field no longer has aria-invalid="true"
    expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
  });
  
  test('form validates email format correctly', async () => {
    render(<FormWithValidation />);
    
    // Enter an invalid email
    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that the email error message is displayed
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is invalid');
    
    // Fix the email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    // Check that the email error message is cleared
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });
  
  test('form validates password match correctly', async () => {
    render(<FormWithValidation />);
    
    // Enter different passwords
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that the confirm password error message is displayed
    expect(screen.getByTestId('confirm-password-error')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent('Passwords do not match');
    
    // Fix the confirm password
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit again
    fireEvent.click(submitButton);
    
    // Check that the confirm password error message is cleared
    expect(screen.queryByTestId('confirm-password-error')).not.toBeInTheDocument();
  });
  
  test('form submits successfully when all fields are valid', async () => {
    render(<FormWithValidation />);
    
    // Fill in all fields correctly
    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Check that the success message is displayed
    expect(screen.getByTestId('success-message')).toBeInTheDocument();
    expect(screen.getByTestId('success-message')).toHaveTextContent('Form submitted successfully!');
  });
}); 