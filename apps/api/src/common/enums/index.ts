export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum EmploymentType {
  PERMANENT = 'PERMANENT',
  CONTRACT_PKWT = 'CONTRACT_PKWT',
  PROBATION = 'PROBATION',
  INTERNSHIP = 'INTERNSHIP',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  EARLY_LEAVE = 'EARLY_LEAVE',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ComponentType {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATING = 'CALCULATING',
  VERIFIED = 'VERIFIED',
  LOCKED = 'LOCKED',
  PUBLISHED = 'PUBLISHED',
}

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
