-- Auto role assignment trigger
-- First user of company = admin, subsequent users = employee

CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  company_exists INTEGER;
BEGIN
  -- Check if any profile exists for this company
  SELECT COUNT(*) INTO company_exists
  FROM profiles
  WHERE company_id = NEW.company_id;

  -- First user of company = admin, else = employee
  IF company_exists = 0 THEN
    NEW.role := 'admin';
  ELSE
    NEW.role := 'employee';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_default_role ON profiles;
CREATE TRIGGER set_default_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_role();
