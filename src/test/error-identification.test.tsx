import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Error Identification Tests (WCAG 3.3.1)
 * 
 * These tests verify that input errors are properly identified and described to users.
 * This ensures that users can understand what errors occurred and how to fix them.
 */

describe('Error Identification (WCAG 3.3.1)', () => {
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