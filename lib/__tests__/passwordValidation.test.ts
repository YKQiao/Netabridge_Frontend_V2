import {
  validateEmail,
  validatePassword,
  doPasswordsMatch,
} from "@/lib/passwordValidation";

// =============================================================================
// validateEmail
// =============================================================================

describe("validateEmail", () => {
  it("rejects an empty string", () => {
    const result = validateEmail("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Email is required");
  });

  it("rejects a whitespace-only string", () => {
    const result = validateEmail("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Email is required");
  });

  it("rejects an address without @", () => {
    const result = validateEmail("notanemail");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a valid email address");
  });

  it("rejects an address without a TLD", () => {
    const result = validateEmail("user@nodomain");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a valid email address");
  });

  it("accepts a standard email address", () => {
    const result = validateEmail("user@company.com");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("trims surrounding whitespace before validation", () => {
    const result = validateEmail("  user@company.com  ");
    expect(result.isValid).toBe(true);
  });

  it("accepts email with subdomains", () => {
    const result = validateEmail("user@mail.company.co.uk");
    expect(result.isValid).toBe(true);
  });
});

// =============================================================================
// validatePassword
// =============================================================================

describe("validatePassword", () => {
  it("marks all requirements false for an empty string", () => {
    const { isValid, requirements } = validatePassword("");
    expect(isValid).toBe(false);
    expect(requirements.hasMinLength).toBe(false);
    expect(requirements.hasUppercase).toBe(false);
    expect(requirements.hasLowercase).toBe(false);
    expect(requirements.hasNumber).toBe(false);
    expect(requirements.hasSpecial).toBe(false);
  });

  it("is invalid for a short password missing several requirements", () => {
    const { isValid, requirements } = validatePassword("weak");
    expect(isValid).toBe(false);
    expect(requirements.hasMinLength).toBe(false);
    expect(requirements.hasUppercase).toBe(false);
    expect(requirements.hasLowercase).toBe(true);
    expect(requirements.hasNumber).toBe(false);
    expect(requirements.hasSpecial).toBe(false);
  });

  it("detects length requirement independently", () => {
    // Exactly 7 chars → still too short
    const { requirements } = validatePassword("Aa1!aaa");
    expect(requirements.hasMinLength).toBe(false);

    // Exactly 8 chars → meets length
    const { requirements: r8 } = validatePassword("Aa1!aaaa");
    expect(r8.hasMinLength).toBe(true);
  });

  it("is valid for a strong password meeting all requirements", () => {
    const { isValid, requirements, error } = validatePassword("Strong1!");
    expect(isValid).toBe(true);
    expect(error).toBeUndefined();
    expect(requirements.hasMinLength).toBe(true);
    expect(requirements.hasUppercase).toBe(true);
    expect(requirements.hasLowercase).toBe(true);
    expect(requirements.hasNumber).toBe(true);
    expect(requirements.hasSpecial).toBe(true);
  });

  it("accepts a longer passphrase with all requirements", () => {
    const { isValid } = validatePassword("MyP@ssw0rd123!");
    expect(isValid).toBe(true);
  });

  it("returns an error message when invalid", () => {
    const { isValid, error } = validatePassword("abc");
    expect(isValid).toBe(false);
    expect(typeof error).toBe("string");
    expect(error!.length).toBeGreaterThan(0);
  });

  it("detects each special character variant", () => {
    const specials = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_"];
    for (const s of specials) {
      const pw = `Lowercase1${s}`;
      expect(validatePassword(pw).requirements.hasSpecial).toBe(true);
    }
  });
});

// =============================================================================
// doPasswordsMatch
// =============================================================================

describe("doPasswordsMatch", () => {
  it("returns true when both passwords are identical", () => {
    expect(doPasswordsMatch("Correct1!", "Correct1!")).toBe(true);
  });

  it("returns false when passwords differ", () => {
    expect(doPasswordsMatch("abc", "xyz")).toBe(false);
  });

  it("returns false for case-sensitive mismatch", () => {
    expect(doPasswordsMatch("Password1!", "password1!")).toBe(false);
  });

  it("returns true for empty strings (both empty)", () => {
    expect(doPasswordsMatch("", "")).toBe(true);
  });

  it("returns false when one is empty", () => {
    expect(doPasswordsMatch("Password1!", "")).toBe(false);
  });
});
