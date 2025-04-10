'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { eventFormSchema } from "@/lib/validator"
import * as z from 'zod'
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./FileUploader"
import { SetStateAction, useState, ChangeEvent } from "react"
import Image from "next/image"
import { Checkbox } from "../ui/checkbox"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/lib/actions/event.actions"
import { IEvent } from "@/lib/database/models/event.model"

type EventFormProps = {
  userId: string
  type: "Create" | "Update"
  event?: IEvent,
  eventId?: string
}



const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const initialValues = event && type === 'Update' 
    ? { 
      ...event, 
      startDateTime: new Date(event.startDateTime), 
      endDateTime: new Date(event.endDateTime) 
    }
    : eventDefaultValues;
  const router = useRouter();

  // Remove startUpload line

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues
  })

  // Remove the uploadthing related imports and the files state
  // Update the onSubmit function:
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    setError(null);
    setSuccess(null);
    
    if (type === 'Create') {
      try {
        setIsSubmitting(true)
        const newEvent = await createEvent({
          event: { ...values },
          userId,
          path: '/profile'
        })
  
        if (newEvent) {
          setSuccess('Event created successfully!')
          form.reset();
          setTimeout(() => {
            router.push(`/events/${newEvent._id}`)
          }, 1000)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create event')
        console.error('Failed to create event:', error);
      } finally {
        setIsSubmitting(false)
      }
    }

    if (type === 'Update') {
      if (!eventId) {
        router.back()
        return;
      }
  
      try {
        setIsSubmitting(true)
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, _id: eventId },
          path: `/events/${eventId}`
        })
  
        if (updatedEvent) {
          setSuccess('Event updated successfully!')
          form.reset();
          setTimeout(() => {
            router.push(`/events/${updatedEvent._id}`)
          }, 1000)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update event')
        console.error('Failed to update event:', error);
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Add this before the return statement
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  }

  // Update the form JSX to show feedback messages
  return (
    <Form {...form}>
      <div className="flex flex-col gap-8 p-6 bg-white rounded-xl shadow-sm">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded animate-fade-in">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded animate-fade-in">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your event a name" {...field} className="input-field focus-within:ring-2 focus-within:ring-primary-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Category</FormLabel>
                  <FormControl>
                    <Dropdown onChangeHandler={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell people about your event..." 
                      {...field} 
                      className="textarea rounded-2xl min-h-[150px] focus-within:ring-2 focus-within:ring-primary-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Event Image</FormLabel>
                  <FormControl>
                    <FileUploader 
                      onFieldChange={field.onChange}
                      imageUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Location</FormLabel>
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2 transition-all hover:bg-grey-100">
                      <Image
                        src="/assets/icons/location-grey.svg"
                        alt="location"
                        width={24}
                        height={24}
                      />
                      <Input placeholder="Event location or Online" {...field} className="input-field !border-none !outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Start Date & Time</FormLabel>
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2 hover:bg-grey-100 transition-all">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <div className="flex gap-2 ml-3">
                        <input
                          type="date"
                          className="bg-transparent text-gray-600 focus:outline-none"
                          value={field.value ? field.value.toISOString().split('T')[0] : ""}
                          onChange={e => field.onChange(new Date(e.target.value))}
                        />
                        <input
                          type="time"
                          className="bg-transparent text-gray-600 focus:outline-none"
                          value={field.value ? field.value.toLocaleTimeString().slice(0, 5) : ""}
                          onChange={e => {
                            const [hour, minute] = e.target.value.split(":").map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hour, minute);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Similar updates for endDateTime field */}
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-semibold">Price</FormLabel>
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2 hover:bg-grey-100 transition-all">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <Input 
                        type="number" 
                        placeholder="Price" 
                        {...field} 
                        className="p-regular-16 border-0 bg-transparent outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                      />
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <label htmlFor="isFree" className="whitespace-nowrap text-gray-600">Free Ticket</label>
                                <Checkbox
                                  onCheckedChange={field.onChange}
                                  checked={field.value}
                                  id="isFree" 
                                  className="h-5 w-5 border-2 border-primary-500" 
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="button col-span-2 w-full md:w-fit transition-all hover:scale-105"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                {type === 'Create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              `${type} Event`
            )}
          </Button>
        </form>
      </div>
    </Form>
  )
}

export default EventForm


// Add image optimization
const optimizeImage = async (file: File) => {
  if (!file) return null
  
  // Check file size
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert('Image size should be less than 5MB')
    return null
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload JPEG, PNG or WebP images only')
    return null
  }

  return file
}

// Update the handleImageUpload function with proper typing
const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  try {
    const file = e.target.files?.[0]
    if (!file) return

    const optimizedFile = await optimizeImage(file)
    if (!optimizedFile) return

    // Continue with upload...
  } catch (error) {
    alert('Error uploading image')
    console.error(error)
  }
}
