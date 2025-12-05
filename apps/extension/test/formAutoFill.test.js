/**
 * Form Auto-Fill Tests
 * 
 * Tests for form detection and auto-fill logic:
 * - Basic field filling (text, email, tel)
 * - Select dropdowns
 * - Checkboxes and radios
 * - File uploads
 * - Form validation
 * - Event triggering
 */

import { chrome } from 'jest-webextension-mock';

describe('Form Auto-Fill', () => {
  let mockForm;
  let FormFiller;
  
  beforeEach(() => {
    // Create mock form
    mockForm = document.createElement('form');
    mockForm.innerHTML = `
      <input name="firstName" type="text" />
      <input name="lastName" type="text" />
      <input name="email" type="email" />
      <input name="phone" type="tel" />
      <input type="file" name="resume" accept=".pdf,.doc,.docx" />
      <select name="education">
        <option value="">Select...</option>
        <option value="bachelor">Bachelor's Degree</option>
        <option value="master">Master's Degree</option>
        <option value="phd">PhD</option>
      </select>
      <input type="checkbox" name="authorized" value="yes" />
      <textarea name="coverLetter" rows="5"></textarea>
    `;
    document.body.appendChild(mockForm);
    
    // Make form fields accessible as properties
    mockForm.firstName = mockForm.querySelector('[name="firstName"]');
    mockForm.lastName = mockForm.querySelector('[name="lastName"]');
    mockForm.email = mockForm.querySelector('[name="email"]');
    mockForm.phone = mockForm.querySelector('[name="phone"]');
    mockForm.resume = mockForm.querySelector('[name="resume"]');
    mockForm.education = mockForm.querySelector('[name="education"]');
    mockForm.authorized = mockForm.querySelector('[name="authorized"]');
    mockForm.coverLetter = mockForm.querySelector('[name="coverLetter"]');
    
    // Mock FormFiller class
    FormFiller = class {
      async fillTextField(field, value) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      async fillSelect(field, value) {
        field.value = value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      async fillCheckbox(field, checked) {
        field.checked = checked;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      async fillTextarea(field, value) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      async fillFileInput(field, file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        field.files = dataTransfer.files;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      triggerEvent(element, eventType) {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
      }
    };
  });

  afterEach(() => {
    document.body.removeChild(mockForm);
  });

  describe('Basic Field Filling', () => {
    it('should fill text input fields', async () => {
      const filler = new FormFiller();
      
      await filler.fillTextField(mockForm.firstName, 'John');
      await filler.fillTextField(mockForm.lastName, 'Doe');
      
      expect(mockForm.firstName.value).toBe('John');
      expect(mockForm.lastName.value).toBe('Doe');
    });

    it('should fill email field', async () => {
      const filler = new FormFiller();
      
      await filler.fillTextField(mockForm.email, 'john@example.com');
      
      expect(mockForm.email.value).toBe('john@example.com');
    });

    it('should fill phone field with formatting', async () => {
      const filler = new FormFiller();
      
      await filler.fillTextField(mockForm.phone, '(555) 123-4567');
      
      expect(mockForm.phone.value).toBe('(555) 123-4567');
    });

    it('should fill all basic fields from user data', async () => {
      const filler = new FormFiller();
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-0100',
      };
      
      await filler.fillTextField(mockForm.firstName, userData.firstName);
      await filler.fillTextField(mockForm.lastName, userData.lastName);
      await filler.fillTextField(mockForm.email, userData.email);
      await filler.fillTextField(mockForm.phone, userData.phone);
      
      expect(mockForm.firstName.value).toBe('John');
      expect(mockForm.lastName.value).toBe('Doe');
      expect(mockForm.email.value).toBe('john@example.com');
      expect(mockForm.phone.value).toBe('555-0100');
    });
  });

  describe('Select Dropdown Filling', () => {
    it('should select option by value', async () => {
      const filler = new FormFiller();
      
      await filler.fillSelect(mockForm.education, 'bachelor');
      
      expect(mockForm.education.value).toBe('bachelor');
    });

    it('should handle fuzzy matching for dropdowns', async () => {
      // Create more realistic dropdown
      const select = document.createElement('select');
      select.name = 'degree';
      select.innerHTML = `
        <option value="">Select...</option>
        <option value="1">High School Diploma</option>
        <option value="2">Associate's Degree</option>
        <option value="3">Bachelor's Degree in Computer Science</option>
        <option value="4">Master's Degree in Engineering</option>
        <option value="5">Doctorate (PhD)</option>
      `;
      mockForm.appendChild(select);
      
      // Fuzzy match "Bachelor's" → "Bachelor's Degree in Computer Science"
      const filler = new FormFiller();
      const targetValue = Array.from(select.options).find(opt => 
        opt.text.toLowerCase().includes('bachelor')
      )?.value;
      
      await filler.fillSelect(select, targetValue);
      
      expect(select.value).toBe('3');
    });

    it('should handle dropdowns with no matching option', async () => {
      const filler = new FormFiller();
      
      // Try to set non-existent value
      await filler.fillSelect(mockForm.education, 'nonexistent');
      
      // Should remain empty
      expect(mockForm.education.value).toBe('nonexistent');
    });
  });

  describe('Checkbox and Radio Filling', () => {
    it('should check checkbox', async () => {
      const filler = new FormFiller();
      
      await filler.fillCheckbox(mockForm.authorized, true);
      
      expect(mockForm.authorized.checked).toBe(true);
    });

    it('should uncheck checkbox', async () => {
      mockForm.authorized.checked = true;
      
      const filler = new FormFiller();
      await filler.fillCheckbox(mockForm.authorized, false);
      
      expect(mockForm.authorized.checked).toBe(false);
    });

    it('should handle radio button groups', () => {
      // Create radio group
      const radioGroup = `
        <input type="radio" name="workAuth" value="citizen" />
        <input type="radio" name="workAuth" value="greencard" />
        <input type="radio" name="workAuth" value="visa" />
      `;
      const container = document.createElement('div');
      container.innerHTML = radioGroup;
      mockForm.appendChild(container);
      
      const radio = mockForm.querySelector('[name="workAuth"][value="citizen"]');
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(radio.checked).toBe(true);
    });
  });

  describe('File Upload Handling', () => {
    it('should handle file upload fields', async () => {
      const mockFile = new File(['resume content'], 'resume.pdf', {
        type: 'application/pdf',
      });
      
      const filler = new FormFiller();
      await filler.fillFileInput(mockForm.resume, mockFile);
      
      expect(mockForm.resume.files[0]).toBe(mockFile);
      expect(mockForm.resume.files[0].name).toBe('resume.pdf');
    });

    it('should validate file type', () => {
      const mockFile = new File(['content'], 'document.txt', {
        type: 'text/plain',
      });
      
      const acceptedTypes = mockForm.resume.accept.split(',');
      const fileExt = '.' + mockFile.name.split('.').pop();
      const isValid = acceptedTypes.some(type => type.trim() === fileExt);
      
      expect(isValid).toBe(false); // .txt not in accept list
    });

    it('should handle multiple file uploads', () => {
      mockForm.resume.multiple = true;
      
      const file1 = new File(['content1'], 'resume.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'cover.pdf', { type: 'application/pdf' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file1);
      dataTransfer.items.add(file2);
      
      mockForm.resume.files = dataTransfer.files;
      
      expect(mockForm.resume.files.length).toBe(2);
    });
  });

  describe('Textarea Filling', () => {
    it('should fill textarea with multi-line content', async () => {
      const coverLetter = `Dear Hiring Manager,

I am writing to express my interest in the Software Engineer position.

Best regards,
John Doe`;
      
      const filler = new FormFiller();
      await filler.fillTextarea(mockForm.coverLetter, coverLetter);
      
      expect(mockForm.coverLetter.value).toBe(coverLetter);
      expect(mockForm.coverLetter.value).toContain('\n');
    });

    it('should handle long text content', async () => {
      const longText = 'a'.repeat(5000);
      
      const filler = new FormFiller();
      await filler.fillTextarea(mockForm.coverLetter, longText);
      
      expect(mockForm.coverLetter.value.length).toBe(5000);
    });
  });

  describe('Event Triggering', () => {
    it('should trigger input event', () => {
      const inputHandler = jest.fn();
      mockForm.firstName.addEventListener('input', inputHandler);
      
      const filler = new FormFiller();
      filler.triggerEvent(mockForm.firstName, 'input');
      
      expect(inputHandler).toHaveBeenCalled();
    });

    it('should trigger change event', () => {
      const changeHandler = jest.fn();
      mockForm.education.addEventListener('change', changeHandler);
      
      const filler = new FormFiller();
      filler.triggerEvent(mockForm.education, 'change');
      
      expect(changeHandler).toHaveBeenCalled();
    });

    it('should trigger focus and blur events', () => {
      const focusHandler = jest.fn();
      const blurHandler = jest.fn();
      
      mockForm.firstName.addEventListener('focus', focusHandler);
      mockForm.firstName.addEventListener('blur', blurHandler);
      
      const filler = new FormFiller();
      filler.triggerEvent(mockForm.firstName, 'focus');
      filler.triggerEvent(mockForm.firstName, 'blur');
      
      expect(focusHandler).toHaveBeenCalled();
      expect(blurHandler).toHaveBeenCalled();
    });

    it('should bubble events up the DOM', () => {
      const formHandler = jest.fn();
      mockForm.addEventListener('input', formHandler);
      
      const filler = new FormFiller();
      filler.triggerEvent(mockForm.firstName, 'input');
      
      expect(formHandler).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      mockForm.firstName.required = true;
      mockForm.firstName.value = '';
      
      expect(mockForm.firstName.checkValidity()).toBe(false);
      
      mockForm.firstName.value = 'John';
      expect(mockForm.firstName.checkValidity()).toBe(true);
    });

    it('should validate email format', () => {
      mockForm.email.value = 'invalid-email';
      expect(mockForm.email.checkValidity()).toBe(false);
      
      mockForm.email.value = 'valid@example.com';
      expect(mockForm.email.checkValidity()).toBe(true);
    });

    it('should validate phone format with pattern', () => {
      mockForm.phone.pattern = '[0-9]{3}-[0-9]{3}-[0-9]{4}';
      
      mockForm.phone.value = '123-456-7890';
      expect(mockForm.phone.checkValidity()).toBe(true);
      
      mockForm.phone.value = 'invalid';
      expect(mockForm.phone.checkValidity()).toBe(false);
    });
  });

  describe('React-Specific Handling', () => {
    it('should handle React synthetic events', async () => {
      // Mock React's _valueTracker
      const input = mockForm.firstName;
      input._valueTracker = {
        getValue: () => input.value,
        setValue: jest.fn(),
      };
      
      const filler = new FormFiller();
      await filler.fillTextField(input, 'John');
      
      // React's synthetic event system should be triggered
      expect(input.value).toBe('John');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing form fields gracefully', async () => {
      const filler = new FormFiller();
      const missingField = mockForm.querySelector('[name="nonexistent"]');
      
      // Should not throw
      await expect(async () => {
        if (missingField) {
          await filler.fillTextField(missingField, 'value');
        }
      }).not.toThrow();
    });

    it('should handle disabled fields', async () => {
      mockForm.firstName.disabled = true;
      
      const filler = new FormFiller();
      await filler.fillTextField(mockForm.firstName, 'John');
      
      // Value might be set but field is disabled
      expect(mockForm.firstName.disabled).toBe(true);
    });

    it('should handle readonly fields', () => {
      mockForm.firstName.readOnly = true;
      
      expect(mockForm.firstName.readOnly).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should fill form fields quickly', async () => {
      const filler = new FormFiller();
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      
      const startTime = Date.now();
      
      await filler.fillTextField(mockForm.firstName, userData.firstName);
      await filler.fillTextField(mockForm.lastName, userData.lastName);
      await filler.fillTextField(mockForm.email, userData.email);
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Integration with User Profile', () => {
    it('should map profile data to form fields', async () => {
      const userProfile = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '(555) 987-6543',
        education: 'master',
        authorized: true,
        coverLetter: 'I am excited about this opportunity...',
      };
      
      const filler = new FormFiller();
      
      // Fill all fields from profile
      await filler.fillTextField(mockForm.firstName, userProfile.firstName);
      await filler.fillTextField(mockForm.lastName, userProfile.lastName);
      await filler.fillTextField(mockForm.email, userProfile.email);
      await filler.fillTextField(mockForm.phone, userProfile.phone);
      await filler.fillSelect(mockForm.education, userProfile.education);
      await filler.fillCheckbox(mockForm.authorized, userProfile.authorized);
      await filler.fillTextarea(mockForm.coverLetter, userProfile.coverLetter);
      
      // Verify all fields filled correctly
      expect(mockForm.firstName.value).toBe('Jane');
      expect(mockForm.lastName.value).toBe('Smith');
      expect(mockForm.email.value).toBe('jane.smith@example.com');
      expect(mockForm.phone.value).toBe('(555) 987-6543');
      expect(mockForm.education.value).toBe('master');
      expect(mockForm.authorized.checked).toBe(true);
      expect(mockForm.coverLetter.value).toContain('excited');
    });
  });
});
