
const currentDate = new Date().toISOString();
import { z } from "zod";
import dayjs from "dayjs";


export const formSchema = z.object({
  profileImage: z.any().nullable(),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Surname must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .or(z.literal("")),
  country: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  status: z.enum(
    ["worker", "cell_leader", "fellowship_leader", "church_pastor", "pastor", "LMA"],
    {
      required_error: "Please select a status.",
    }
  ),
  phoneNumber: z.string().optional(),
  church: z.string(),
  fellowship: z.string(),
  cell: z.string(),
  homeAddress: z.string().min(5, {
    message: "Please enter a valid home address.",
  }),
  workAddress: z.string(),
  dateOfBirth: z
    .date({
      required_error: "Please select your date of birth",
    })
    .refine(
      (value: any) =>
        value === currentDate ||
        !dayjs(value).isAfter(dayjs(currentDate).subtract(7, "days"), "day"),
      {
        message: "Oops, you can only select past dates",
      }
    ),
  department: z.string().optional(),
  prayerGroup: z.string().min(1, {
    message: "Please select a prayer group.",
  }),
  dateJoinedChurch: z
    .date({
      required_error: "Please select a valid date",
    })
    .refine(
      (value: any) =>
        value === currentDate || !dayjs(value).isAfter(dayjs(), "day"),
      {
        message: "Oops, you can only select past dates",
      }
    ),
  dateBecameWorker: z
    .date({
      required_error: "Please select a valid date",
    })
    .refine(
      (value: any) =>
        value === currentDate || !dayjs(value).isAfter(dayjs(), "day"),
      {
        message: "Oops, you can only select past dates",
      }
    ),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms and conditions." }),
  }),
  privacyAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the privacy policy." }),
  }),
});
