-- =========================================================================
-- AL RAUF HEALTH CARE - SUPABASE CLINIC DATABASE SCHEMA
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    token_number TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INTEGER NOT NULL DEFAULT 30,
    patient_gender TEXT NOT NULL DEFAULT 'Other',
    reason_for_visit TEXT NOT NULL DEFAULT 'Consultation',
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_specialty TEXT NOT NULL,
    doctor_fee NUMERIC NOT NULL DEFAULT 4000,
    doctor_room TEXT NOT NULL DEFAULT '01',
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'JazzCash',
    sender_name TEXT NOT NULL,
    trx_id TEXT NOT NULL DEFAULT 'N/A',
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PENDING_VERIFICATION', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- 2. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_token ON public.appointments(token_number);

-- 3. Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to slot statuses & token verification (only non-sensitive or masked fields handled by API)
CREATE POLICY "Allow service role full access" 
ON public.appointments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 4. Create Storage Bucket for Payment Receipts (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-receipts', 'clinic-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read for clinic-receipts
CREATE POLICY "Public Access for Clinic Receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-receipts');

-- Allow service role / authenticated upload
CREATE POLICY "Allow Service Upload Receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-receipts');
