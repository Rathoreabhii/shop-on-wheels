CREATE POLICY "Allow anonymous read of pending rides"
ON public.rides FOR SELECT
TO anon
USING (status = 'pending');