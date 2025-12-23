-- Create table to store OTP codes
CREATE TABLE public.phone_otp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  action TEXT DEFAULT 'signup',
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_phone_otp_phone ON public.phone_otp(phone);
CREATE INDEX idx_phone_otp_expires ON public.phone_otp(expires_at);

-- Enable RLS (but allow edge functions with service role to access)
ALTER TABLE public.phone_otp ENABLE ROW LEVEL SECURITY;

-- No public access - only service role can access this table
-- This is intentional as OTP operations happen through edge functions