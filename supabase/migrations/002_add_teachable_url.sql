-- Add teachable_url column to courses table
-- This column stores the Teachable course URL for enrolled students

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS teachable_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN courses.teachable_url IS 'رابط الكورس على منصة Teachable للطلاب المسجلين';

-- Update existing courses with their Teachable URLs
-- ⚠️ يرجى تحديث هذه الروابط بالروابط الصحيحة لكورساتك

UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/nmap' WHERE slug = 'nmap';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/metasploit' WHERE slug = 'metasploit';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/bug-bounty' WHERE slug = 'bug-bounty';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/ethical-hacking' WHERE slug = 'ethical-hacking';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/dark-web' WHERE slug = 'dark-web';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/security-plus' WHERE slug = 'comptia-security-plus';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/dark-hacker' WHERE slug = 'dark-hacker';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/python' WHERE slug = 'python';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/snapchat-ads' WHERE slug = 'snapchat-ads';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/tiktok-ads' WHERE slug = 'tiktok-ads';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/linkedin-ads' WHERE slug = 'linkedin-ads';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/meta-ads' WHERE slug = 'meta-ads';
UPDATE courses SET teachable_url = 'https://s7s-ads.teachable.com/p/linux-rhcsa' WHERE slug = 'linux-rhcsa';
