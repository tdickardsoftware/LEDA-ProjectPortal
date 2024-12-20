'use client'

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import validator from 'validator';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import StatePicker from './ui/state-selector';
import GenderSelector from './ui/gender-selector';
import { toast } from 'sonner';
import PhoneNumberInput from '@/components/ui/phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import React from 'react';
import PlayerTypeSelector from './ui/player-type-selector';
import SeasonCodeSelector from './ui/season-code-selector';

const placeFormSchema = z.object({ 
    ledaId: z.number().min(0, { message: 'LEDA ID Must be a Postive Number.' }),

});