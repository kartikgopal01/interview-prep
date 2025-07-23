import React from 'react'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Controller, FieldValues, Path, Control } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder: string;
    type?: 'text' | 'email' | 'password' | 'file';
}

const FormField = <T extends FieldValues>({control, name, label, placeholder, type="text"}: FormFieldProps<T>) => (
    <Controller name={name} control={control} render={({ field }) => (
        <FormItem className="space-y-2">
            <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
            <FormControl>
                <Input 
                    className="h-12 px-4 text-base border-2 border-border focus:border-primary transition-colors" 
                    type={type} 
                    placeholder={placeholder} 
                    {...field} 
                />
            </FormControl>
            <FormMessage className="text-sm text-red-600" />
        </FormItem>
    )}
/>);

export default FormField
