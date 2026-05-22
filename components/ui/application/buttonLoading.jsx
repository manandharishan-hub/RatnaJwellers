"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const ButtonLoading = ({ type, text, loading, className,onClick, ...props}) => {
  return (
    <Button 
    type={type} 
    disabled={loading} 
    onClick={onClick}
    className={className}
    {...props}>
      {loading && <Loader2 className=" animate-spin" />}
      {text}
    </Button>
  )
}

export default ButtonLoading