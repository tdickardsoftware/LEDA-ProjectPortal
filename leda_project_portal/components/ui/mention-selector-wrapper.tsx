"use client";

/**
 * MentionSelectorWrapper
 *
 * A thin React Hook Form provider wrapper around MentionSelector,
 * allowing it to be used outside of an existing form context.
 */

import { useForm, FormProvider } from "react-hook-form";
import MentionSelector from "@/components/ui/mentions-selector";

interface MentionData {
	mentionCode: string;
	desc: string;
	points: string;
	mentionBasis: string;
}

interface MentionSelectorWrapperProps {
	onMentionChange: (value: MentionData) => void;
	initialValue?: MentionData | null;
}

export default function MentionSelectorWrapper({
	onMentionChange,
	initialValue,
}: MentionSelectorWrapperProps) {
	const form = useForm({
		defaultValues: {
			mentionData: initialValue || {},
		},
	});

	return (
		<FormProvider {...form}>
			<MentionSelector
				control={form.control}
				name="mentionData"
				label=""
				disabled={false}
				handleMentionChange={onMentionChange}
			/>
		</FormProvider>
	);
}
