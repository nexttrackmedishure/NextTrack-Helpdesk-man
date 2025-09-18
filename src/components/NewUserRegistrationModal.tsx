import React, { useState, useCallback, memo } from "react";
import { X, User as UserIcon, Eye, EyeOff, Upload } from "lucide-react";
import { registerUser, validateUserData, User } from "../services/userService";

// Memoized input component to prevent unnecessary re-renders
const MemoizedInput = memo(
  ({
    type,
    value,
    onChange,
    placeholder,
    className,
    autoComplete,
    error,
  }: {
    type: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className: string;
    autoComplete?: string;
    error?: string;
  }) => {
    return (
      <>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={className}
          placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </>
    );
  }
);

interface NewUserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface FormErrors {
  idNumber?: string;
  fullName?: string;
  nickname?: string;
  department?: string;
  branch?: string;
  contactNumber?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  submit?: string;
}

const NewUserRegistrationModal: React.FC<NewUserRegistrationModalProps> =
  React.memo(({ isOpen, onClose, onUserCreated }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
      useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState({
      idNumber: "",
      fullName: "",
      nickname: "",
      department: "",
      branch: "",
      contactNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });

    // Dropdown options
    const departmentOptions = [
      "IT",
      "Digital Marketing",
      "Sales and Renewals",
      "Placement",
      "Claims",
      "General Insurance (GI)",
      "Management",
      "Administrative",
      "HR & Accounting",
    ];

    const branchOptions = [
      "Philippines | Manila",
      "Philippines | Bacolod",
      "Indonesia | Jakarta",
      "Indonesia | Bali",
      "Singapore | Tampines",
    ];

    const roleOptions = ["Administrator", "IT Support", "Member"];

    // ID Number format validation and generation
    const getIDNumberFormat = (branch: string): string => {
      if (branch.includes("Philippines")) return "JIAI-0000";
      if (branch.includes("Indonesia")) return "PLMI-0000";
      if (branch.includes("Singapore")) return "BAPL-0000";
      return "XXXX-0000";
    };

    const validateIDNumber = (idNumber: string, branch: string): boolean => {
      if (branch.includes("Philippines")) {
        return /^JIAI-\d{4}$/.test(idNumber);
      }
      if (branch.includes("Indonesia")) {
        return /^PLMI-\d{4}$/.test(idNumber);
      }
      if (branch.includes("Singapore")) {
        return /^BAPL-\d{4}$/.test(idNumber);
      }
      return false;
    };

    // Contact number format validation
    const validateContactNumber = (contactNumber: string, branch: string): boolean => {
      if (branch.includes("Philippines")) {
        // Philippines: +63 9XX XXX XXXX or 09XX XXX XXXX
        return /^(\+63|0)9\d{2}\s?\d{3}\s?\d{4}$/.test(contactNumber.replace(/\s/g, ''));
      }
      if (branch.includes("Indonesia")) {
        // Indonesia: +62 8XX XXXX XXXX or 08XX XXXX XXXX
        return /^(\+62|0)8\d{2}\s?\d{4}\s?\d{4}$/.test(contactNumber.replace(/\s/g, ''));
      }
      if (branch.includes("Singapore")) {
        // Singapore: +65 9XXX XXXX or 9XXX XXXX
        return /^(\+65\s?)?9\d{3}\s?\d{4}$/.test(contactNumber.replace(/\s/g, ''));
      }
      return false;
    };

    // Handle input changes - optimized with useCallback
    const handleInputChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      setErrors((prev) => {
        if (prev[field as keyof FormErrors]) {
          return {
            ...prev,
            [field]: undefined,
          };
        }
        return prev;
      });
    }, []);

    // Handle profile image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Check file size (1MB = 1024 * 1024 bytes)
        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
          setErrors({ submit: "Profile image size must be less than 1MB" });
          // Clear the file input
          event.target.value = "";
          return;
        }

        // Check file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          setErrors({
            submit:
              "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
          });
          // Clear the file input
          event.target.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target?.result as string);
          // Clear any previous errors
          if (errors.submit) {
            setErrors((prev) => ({ ...prev, submit: undefined }));
          }
        };
        reader.readAsDataURL(file);
      }
    };

    // Validate form
    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      // Required field validations
      if (!formData.idNumber.trim()) {
        newErrors.idNumber = "ID Number is required";
      } else if (formData.branch && !validateIDNumber(formData.idNumber, formData.branch)) {
        newErrors.idNumber = `ID Number must follow format: ${getIDNumberFormat(formData.branch)}`;
      }

      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full Name is required";
      }

      if (!formData.nickname.trim()) {
        newErrors.nickname = "Nickname is required";
      }

      if (!formData.department) {
        newErrors.department = "Department is required";
      }

      if (!formData.branch) {
        newErrors.branch = "Branch is required";
      }

      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = "Contact Number is required";
      } else if (formData.branch && !validateContactNumber(formData.contactNumber, formData.branch)) {
        if (formData.branch.includes("Philippines")) {
          newErrors.contactNumber = "Contact Number must be in format: +63 9XX XXX XXXX or 09XX XXX XXXX";
        } else if (formData.branch.includes("Indonesia")) {
          newErrors.contactNumber = "Contact Number must be in format: +62 8XX XXXX XXXX or 08XX XXXX XXXX";
        } else if (formData.branch.includes("Singapore")) {
          newErrors.contactNumber = "Contact Number must be in format: +65 9XXX XXXX or 9XXX XXXX";
        }
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(
          formData.password
        )
      ) {
        newErrors.password =
          "Password must contain uppercase, lowercase, and number";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm Password is required";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData.role) {
        newErrors.role = "Role is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      try {
        const userData: Omit<
          User,
          "createdAt" | "isActive" | "lastLogin" | "_id"
        > = {
          idNumber: formData.idNumber.trim(),
          fullName: formData.fullName.trim(),
          nickname: formData.nickname.trim(),
          department: formData.department,
          branch: formData.branch,
          contactNumber: formData.contactNumber.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role as "Administrator" | "IT Support" | "Member",
          profileImage: profileImage || undefined,
        };

        const result = await registerUser(userData);

        if (result.success) {
          // Reset form
          setFormData({
            idNumber: "",
            fullName: "",
            nickname: "",
            department: "",
            branch: "",
            contactNumber: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "",
          });
          setProfileImage(null);
          setErrors({});

          // Notify parent component
          onUserCreated();

          // Close modal
          onClose();
        } else {
          setErrors({ submit: result.message });
        }
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ submit: "Registration failed. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    // Handle modal close
    const handleClose = () => {
      if (!isLoading) {
        setFormData({
          idNumber: "",
          fullName: "",
          nickname: "",
          department: "",
          branch: "",
          contactNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
        });
        setProfileImage(null);
        setErrors({});
        onClose();
      }
    };

    return (
      <>
        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6d28d9;
        }
        .custom-scrollbar::-webkit-scrollbar-button {
          display: none;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
      `}</style>
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
            !isOpen ? "hidden" : ""
          }`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                New User Form
              </h2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Image:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum file size: 1MB. Supported formats: JPEG, PNG, GIF,
                      WebP
                    </p>
                  </div>
                </div>

                {/* Break Line */}
                <hr className="border-gray-200 dark:border-gray-600" />

                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Basic Information:
                  </h3>
                  <div className="space-y-4">
                    {/* Row 1: ID Number only */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ID Number: *
                        </label>
                        <MemoizedInput
                          type="text"
                          value={formData.idNumber}
                          onChange={(value) =>
                            handleInputChange("idNumber", value)
                          }
                          autoComplete="off"
                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.idNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={formData.branch ? getIDNumberFormat(formData.branch) : "Select branch first"}
                          error={errors.idNumber}
                        />
                      </div>
                      <div></div>
                    </div>

                    {/* Row 2: Full Name and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name: *
                        </label>
                        <MemoizedInput
                          type="text"
                          value={formData.fullName}
                          onChange={(value) =>
                            handleInputChange("fullName", value)
                          }
                          autoComplete="off"
                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter Full Name"
                          error={errors.fullName}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department: *
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.department
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Department</option>
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                        {errors.department && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.department}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Nickname and Branch */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nickname: *
                        </label>
                        <MemoizedInput
                          type="text"
                          value={formData.nickname}
                          onChange={(value) =>
                            handleInputChange("nickname", value)
                          }
                          autoComplete="off"
                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.nickname
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter Nickname"
                          error={errors.nickname}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Branch: *
                        </label>
                        <select
                          value={formData.branch}
                          onChange={(e) =>
                            handleInputChange("branch", e.target.value)
                          }
                          className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.branch ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Branch</option>
                          {branchOptions.map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                        </select>
                        {errors.branch && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.branch}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Break Line */}
                <hr className="border-gray-200 dark:border-gray-600" />

                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Contact Information:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Number: *
                      </label>
                      <MemoizedInput
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(value) =>
                          handleInputChange("contactNumber", value)
                        }
                        autoComplete="off"
                        className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.contactNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={
                          formData.branch?.includes("Philippines") ? "+63 9XX XXX XXXX or 09XX XXX XXXX" :
                          formData.branch?.includes("Indonesia") ? "+62 8XX XXXX XXXX or 08XX XXXX XXXX" :
                          formData.branch?.includes("Singapore") ? "+65 9XXX XXXX or 9XXX XXXX" :
                          "Select branch first"
                        }
                        error={errors.contactNumber}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address: *
                      </label>
                      <MemoizedInput
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        autoComplete="off"
                        className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter Email Address"
                        error={errors.email}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This will be used for login and system notifications
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password: *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          autoComplete="new-password"
                          className={`w-full px-3 py-1 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 8 characters with uppercase, lowercase,
                        and number
                      </p>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password: *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          autoComplete="new-password"
                          className={`w-full px-3 py-1 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Confirm Password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Re-enter the password to confirm
                      </p>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Break Line */}
                <hr className="border-gray-200 dark:border-gray-600" />

                {/* Role & Access Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Role & Access:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role: *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.role ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Role</option>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.role}
                        </p>
                      )}
                    </div>
                    <div></div>
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.submit}
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  });

NewUserRegistrationModal.displayName = "NewUserRegistrationModal";

export default NewUserRegistrationModal;
