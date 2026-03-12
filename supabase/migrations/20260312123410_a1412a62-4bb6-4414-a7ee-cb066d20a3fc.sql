
-- Drop the recursive policies
DROP POLICY IF EXISTS "Drivers can see pending rides" ON public.rides;
DROP POLICY IF EXISTS "Drivers can update their rides" ON public.rides;
DROP POLICY IF EXISTS "Users can see drivers on their rides" ON public.drivers;

-- Create security definer functions to break recursion
CREATE OR REPLACE FUNCTION public.get_driver_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.drivers WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_ride_driver_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT driver_id FROM public.rides WHERE user_id = _user_id AND driver_id IS NOT NULL;
$$;

-- Recreate policies using the functions
CREATE POLICY "Drivers can see pending rides"
ON public.rides FOR SELECT
TO authenticated
USING (
  status = 'pending' OR driver_id = public.get_driver_id_for_user(auth.uid())
);

CREATE POLICY "Drivers can update their rides"
ON public.rides FOR UPDATE
TO authenticated
USING (
  driver_id = public.get_driver_id_for_user(auth.uid())
);

CREATE POLICY "Users can see drivers on their rides"
ON public.drivers FOR SELECT
TO authenticated
USING (
  id IN (SELECT public.get_user_ride_driver_ids(auth.uid()))
);
