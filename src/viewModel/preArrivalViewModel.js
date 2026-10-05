import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../api/client';
import {
    getMyPreArrivalForm,
    submitPreArrivalForm,
} from '../api/service/preArrivalService';

/**
 * Pre-Arrival Form ViewModel — ALL state, validation, API calls.
 * The page component only renders.
 *
 * The questions are not hard-coded: the hotel builds them, so this walks
 * whatever sections the server sends and keeps answers in a flat
 * { fieldKey: value } map, which is exactly the shape the submit route wants.
 */

export const FIELD = {
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    NUMBER: 'NUMBER',
    DATE: 'DATE',
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    SELECT: 'SELECT',
    MULTI_SELECT: 'MULTI_SELECT',
    YES_NO: 'YES_NO',
    CONSENT: 'CONSENT',
    SIGNATURE: 'SIGNATURE',
    INFO: 'INFO',
};

const isBlank = (v) =>
    v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/** Mirrors the server rule: a field with an unmet `showIf` is not asked. */
export const isFieldVisible = (field, answers) => {
    if (!field.showIf) return true;
    return String(answers[field.showIf.field] ?? '') === field.showIf.equals;
};

export function usePreArrivalViewModel() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [booking, setBooking] = useState(null);
    const [answers, setAnswers] = useState({});
    const [otherAnswers, setOtherAnswers] = useState({});
    const [loadError, setLoadError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyPreArrivalForm();
            const data = res?.data || {};
            setForm(data.form || null);
            setSubmission(data.submission || null);
            setBooking(data.booking || null);
            // Prefill from whatever was submitted before, so a revisit is an edit.
            setAnswers(data.submission?.answers ? { ...data.submission.answers } : {});
            setOtherAnswers(
                data.submission?.otherAnswers ? { ...data.submission.otherAnswers } : {},
            );
            setLoadError('');
        } catch (error) {
            setLoadError(getApiErrorMessage(error, 'Could not load the form.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const sections = useMemo(() => form?.sections || [], [form]);

    const setAnswer = (key, value) =>
        setAnswers((prev) => ({ ...prev, [key]: value }));

    const setOther = (key, value) =>
        setOtherAnswers((prev) => ({ ...prev, [key]: value }));

    /** Tick / untick one choice of a MULTI_SELECT. */
    const toggleChoice = (key, value) =>
        setAnswers((prev) => {
            const current = Array.isArray(prev[key]) ? prev[key] : [];
            return {
                ...prev,
                [key]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });

    /**
     * Same rule as the server: required only counts for fields the guest can
     * actually see. Returns the first problem, or null.
     */
    const firstProblem = () => {
        for (const section of sections) {
            for (const field of section.fields || []) {
                if (field.type === FIELD.INFO) continue;
                if (!field.required) continue;
                if (!isFieldVisible(field, answers)) continue;

                const value = answers[field.key];
                const missing =
                    field.type === FIELD.CONSENT ? value !== true : isBlank(value);
                if (missing) {
                    return field.type === FIELD.CONSENT
                        ? 'Please accept the consent to continue.'
                        : `${field.label || 'A required question'} is required.`;
                }
            }
        }
        return null;
    };

    const submit = async () => {
        const problem = firstProblem();
        if (problem) {
            toast.error(problem);
            return false;
        }

        // Never send answers to questions the guest could not see — a follow-up
        // they filled in then hid by changing the parent answer must not persist.
        const visible = {};
        sections.forEach((section) => {
            (section.fields || []).forEach((field) => {
                if (field.type === FIELD.INFO) return;
                if (!isFieldVisible(field, answers)) return;
                if (isBlank(answers[field.key])) return;
                visible[field.key] = answers[field.key];
            });
        });

        setSubmitting(true);
        try {
            const res = await submitPreArrivalForm({
                answers: visible,
                otherAnswers,
            });
            toast.success(res?.message || 'Thank you — your form has been submitted.');
            await load();
            return true;
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Could not submit the form.'));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        loading,
        submitting,
        loadError,
        form,
        sections,
        booking,
        submission,
        answers,
        otherAnswers,
        setAnswer,
        setOther,
        toggleChoice,
        submit,
        reload: load,
        // Staff have read it — the desk owns corrections from here on.
        isLocked: submission?.status === 'REVIEWED',
        hasSubmitted: Boolean(submission),
        isEnabled: form?.isEnabled !== false,
    };
}
