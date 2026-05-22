"use client"

import { FormProvider, Controller, useFormContext } from "react-hook-form"

export const Form = FormProvider

export const FormField = ({ name, render }) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={render}
    />
  )
}

export const FormItem = ({ children }) => <div className="space-y-2">{children}</div>

export const FormLabel = ({ children }) => <label className="block text-sm font-medium">{children}</label>

export const FormControl = ({ children }) => <div>{children}</div>

export const FormDescription = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
)

export const FormMessage = () => null