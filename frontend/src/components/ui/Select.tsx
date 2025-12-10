

import React, { createContext, useContext, useState } from "react"

interface SelectContextType {
  selectedValue: string
  onValueChange: (value: string) => void
  placeholder?: string
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within the <Select> component.")
  }
  return context
}


interface SelectProps extends React.PropsWithChildren<{
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}> {}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange, placeholder }) => {
  return (
    <SelectContext.Provider value={{ selectedValue: value, onValueChange, placeholder }}>
      {}
      {children}
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = "", ...props }) => {
  const { selectedValue, onValueChange, placeholder } = useSelectContext()
  const selectOptions = React.Children.toArray(children).find(
    (child: any) => child.type === SelectContent
  )

  return (
    <select
      {...props}
      value={selectedValue}
      onChange={(e) => onValueChange(e.target.value)}
      className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full ${className}`}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {}
      {selectOptions}
    </select>
  )
}

export const SelectValue: React.FC<React.PropsWithChildren<{ placeholder?: string }>> = ({ placeholder }) => {
  const { selectedValue } = useSelectContext()
  return (
    <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
      {selectedValue || placeholder || "Wybierz..."}
    </span>
  )
}



export const SelectContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>
}


export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}