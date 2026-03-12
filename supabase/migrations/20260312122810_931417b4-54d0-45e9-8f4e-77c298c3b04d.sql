
-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'auto',
  vehicle_number TEXT,
  license_number TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT false,
  current_lat NUMERIC,
  current_lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add driver_id to rides table
ALTER TABLE public.rides ADD COLUMN driver_id UUID REFERENCES public.drivers(id);

-- Enable RLS on drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can read their own profile
CREATE POLICY "Drivers can read own profile"
ON public.drivers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Drivers can update their own profile
CREATE POLICY "Drivers can update own profile"
ON public.drivers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Drivers can insert their own profile
CREATE POLICY "Drivers can insert own profile"
ON public.drivers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Shopkeepers can see driver info for their rides
CREATE POLICY "Users can see drivers on their rides"
ON public.drivers FOR SELECT
TO authenticated
USING (
  id IN (SELECT driver_id FROM public.rides WHERE user_id = auth.uid())
);

-- Drivers can see rides that are pending (to accept them)
CREATE POLICY "Drivers can see pending rides"
ON public.rides FOR SELECT
TO authenticated
USING (
  status = 'pending' OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- Drivers can update rides assigned to them
CREATE POLICY "Drivers can update their rides"
ON public.rides FOR UPDATE
TO authenticated
USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- Enable realtime for rides so drivers get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
