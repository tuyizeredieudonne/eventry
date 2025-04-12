'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  Form 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { eventFormSchema } from "@/lib/validator"
import * as z from 'zod'
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./FileUploader"
import { useState } from "react"
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
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues
  })

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    message: '',
    type: 'info' as 'info' | 'error' | 'success'
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    setFeedback({ message: '', type: 'info' });
    try {
      setIsSubmitting(true);
      setFeedback({ message: 'Processing your request...', type: 'info' });

      if (!userId) {
        setFeedback({ message: 'Please log in to create/update an event', type: 'error' });
        return;
      }

      // Validate required fields
      if (!values.title || !values.description || !values.imageUrl || !values.categoryId) {
        setFeedback({ message: 'Please fill in all required fields', type: 'error' });
        return;
      }

      // Validate dates
      if (new Date(values.startDateTime) < new Date()) {
        setError('Start date cannot be in the past');
        return;
      }

      if (new Date(values.endDateTime) < new Date(values.startDateTime)) {
        setError('End date must be after start date');
        return;
      }

      const eventData = {
        ...values,
        startDateTime: new Date(values.startDateTime),
        endDateTime: new Date(values.endDateTime),
        price: values.isFree ? '0' : values.price
      };

      if (type === 'Create') {
        setFeedback({ message: 'Creating your event...', type: 'info' });
        const newEvent = await createEvent({
          event: eventData,
          userId,
          path: '/profile'
        });

        if (newEvent) {
          setFeedback({ message: 'Event created successfully!', type: 'success' });
          setTimeout(() => {
            router.push(`/events/${newEvent._id}`);
          }, 1000);
        } else {
          setFeedback({ message: 'Failed to create event', type: 'error' });
        }
      }

      if (type === 'Update' && eventId) {
        const updatedEvent = await updateEvent({
          userId,
          event: { ...eventData, _id: eventId },
          path: `/events/${eventId}`
        });

        if (updatedEvent) {
          router.push(`/events/${eventId}`);
        } else {
          setError('Failed to update event');
        }
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {feedback.message && (
          <div className={`p-4 rounded-lg mb-4 ${
            feedback.type === 'error' ? 'bg-red-50 text-red-500' :
            feedback.type === 'success' ? 'bg-green-50 text-green-500' :
            'bg-blue-50 text-blue-500'
          }`}>
            {feedback.message}
          </div>
        )}
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
                    <input
                      type="datetime-local"
                      className="bg-transparent text-gray-600 focus:outline-none ml-3 w-full"
                      value={field.value?.toISOString().slice(0, 16)}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-semibold">End Date & Time</FormLabel>
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2 hover:bg-grey-100 transition-all">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <input
                      type="datetime-local"
                      className="bg-transparent text-gray-600 focus:outline-none ml-3 w-full"
                      value={field.value?.toISOString().slice(0, 16)}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      min={field.value?.toISOString().slice(0, 16)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <label htmlFor="isFree" className="whitespace-nowrap text-gray-600">Free Ticket</label>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          form.setValue('price', '0')
                        }
                      }}
                      checked={field.value}
                      id="isFree" 
                      className="h-5 w-5 border-2 border-primary-500" 
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

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
                      disabled={form.watch('isFree')}
                      onChange={(e) => {
                        const value = e.target.value || '0'
                        field.onChange(value)
                      }}
                      className="p-regular-16 border-0 bg-transparent outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
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
          className={`button col-span-2 w-full md:w-fit ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            )}
            <span>
              {isSubmitting 
                ? `${type === 'Create' ? 'Creating' : 'Updating'}...` 
                : `${type} Event`}
            </span>
          </div>
        </Button>
      </form>
    </Form>
  );
};

export default EventForm
