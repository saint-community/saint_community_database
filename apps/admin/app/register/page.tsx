/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@workspace/ui/components/button";
import { useForm } from "@workspace/ui/lib/react-hook-form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { DatePicker } from "@workspace/ui/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FieldInfo } from "@workspace/ui/components/field-info";
import { useMutation } from "@tanstack/react-query";
import { createWorker } from "@/services/workers";
import { useWorkerForm } from "@/hooks/workers";
import { Loader, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@workspace/ui/lib/sonner";
import { Suspense, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { formSchema } from "@/utils/registerSchema";
import { isEmpty } from "lodash";

const currentDate = new Date().toISOString();


const genders = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
];

function RegisterPageMain() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data, error, isLoading } = useWorkerForm(token || "");
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Import countries.json dynamically to avoid SSR issues
  const [countries, setCountries] = useState<{ code: string; name: string }[]>(
    []
  );
  useEffect(() => {
    import("@/utils/countries.json").then((mod) => {
      setCountries(mod.default || mod);
    });
  }, []);

  const RequiredAsterisk = () => <span className="text-rose-500">*</span>;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    if (selectedCountry) {
      import("@/utils/states.json").then((mod) => {
        type AllStates = { [countryCode: string]: string[] };
        const allStates = (mod.default || mod) as unknown as AllStates;
        setStates(allStates[selectedCountry as keyof AllStates] || []);
      });
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (file && typeof file === "object" && "name" in file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const { church, fellowships, cells, prayerGroups, departments } =
    useMemo(() => {
      const church = {
        id: data?.data?.churchInformation?.id || "",
        name: data?.data?.churchInformation?.name || "",
      };
      const fellowships = data?.data?.churchInformation?.fellowships;
      const cells = data?.data?.churchInformation?.cells;

      const prayerGroups = data?.data?.prayerGroups?.map(
        (prayerGroup: { day: string; schedule: string; id: string }) => ({
          value: prayerGroup.id,
          label: `${prayerGroup.day} (${prayerGroup.schedule})`,
        })
      );

      const departments = data?.data?.departments?.map(
        (department: { name: string; id: string }) => ({
          value: department.id,
          label: department.name,
        })
      );

      return { church, fellowships, cells, prayerGroups, departments };
    }, [data]);
    

  function normalizeServerErrors(
    errors: Record<string, string[] | string>
  ): Record<string, string> {
    const result: any = {};

    for (const [field, messages] of Object.entries(errors)) {
      result[field] = Array.isArray(messages) ? messages[0] : messages;
    }

    return result;
  }

  const mutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      toast.success("Account created successfully");
      form.reset();
      router.push("/completed");
    },
    onError: (error) => {
      // Type guard for AxiosError
      const err = error as any;
      const response = err?.response;

      if (response?.data?.errors) {
        const normalized = normalizeServerErrors(response.data.errors);

        setErrors(normalized);
        toast.error("Please fix the errors in the form");
        return;
      }

      if (response?.data?.message) {
        toast.error(response.data.message);
        return;
      }

      toast.error("Failed to create account");
    },
  });

  const form = useForm({
    defaultValues: {
      profileImage: null as File | null,
      firstName: "",
      lastName: "",
      country: "",
      state: "",
      email: "",
      gender: "",
      phoneNumber: "",
      church: church?.id?.toString() || "",
      fellowship: fellowships?.[0]?.id?.toString() || "",
      cell: cells?.[0]?.id?.toString() || "",
      homeAddress: "",
      workAddress: "",
      dateOfBirth: dayjs(currentDate).subtract(7, "years").toDate(),
      department: "",
      dateJoinedChurch: dayjs(currentDate).subtract(7, "days").toDate(),
      prayerGroup: "",
      dateBecameWorker: dayjs(currentDate).subtract(7, "days").toDate(),
    },
   
    validators: {
      // suppress type error as formSchema matches the expected type
      /* @ts-ignore */
      onSubmit: formSchema,
       /* @ts-ignore */
      onChange: formSchema,
      onChangeAsync: ({ formApi }) => {
        formApi.setFieldValue("church", church?.id?.toString());
        fellowships.length === 1 &&
          formApi.setFieldValue("fellowship", fellowships?.[0]?.id?.toString());
        cells.length === 1 &&
          formApi.setFieldValue("cell", cells?.[0]?.id?.toString());
      },
    },
    onSubmit: async ({ value }) => {
      // Handle form submission here
      
      const formData = new FormData();

      if (value.profileImage) {
        formData.append("profile_image", value.profileImage);
      }
      formData.append("church_id", String(value.church));
      formData.append("fellowship_id", String(value.fellowship));
      formData.append("cell_id", String(value.cell));
      formData.append("first_name", value.firstName || "");
      formData.append("last_name", value.lastName || "");
      formData.append(
        "dob",
        value.dateOfBirth.toISOString().split("T")[0] ?? ""
      );
      formData.append("gender", value.gender);
      formData.append("status", "worker");
      formData.append("phone_number", value.phoneNumber);
      formData.append("email", value.email);
      formData.append("facebook_username", "");
      formData.append("twitter_username", "");
      formData.append("instagram_username", "");
      formData.append("house_address", value.homeAddress);
      formData.append("work_address", value.workAddress);
      formData.append(
        "member_since",
        value.dateJoinedChurch.toISOString().split("T")[0] ?? ""
      );
      formData.append(
        "worker_since",
        value.dateJoinedChurch.toISOString().split("T")[0] ?? ""
      );
      formData.append("active", "true");
      formData.append("prayer_group_id", value.prayerGroup);
      if (value.department) {
        formData.append("department_id", String(value.department));
      }
      formData.append("country", value.country);
      formData.append("state", value.state);
      formData.append(
        "date_joined_church",
        value.dateJoinedChurch.toISOString().split("T")[0] ?? ""
      );
      formData.append(
        "date_became_worker",
        value.dateBecameWorker.toISOString().split("T")[0] ?? ""
      );

      mutation.mutate(formData);
    } ,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[375px] mx-auto bg-white">
        <Loader className="w-12 h-12 animate-spin mb-4 text-gray-400" />
        <span className="text-gray-500">Hang tight, we're loading 🚀</span>
      </div>
    );
  }
  const isAxiosError =
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object";

  if (
    !token ||
    (isAxiosError &&
      (error as any).response?.status === 404 &&
      !(error as any).response?.data?.success)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[375px] mx-auto bg-white">
        <div className="text-center px-4">
          <h2 className="text-lg font-semibold text-rose-600 mb-2">
            Oops! Registration Link Invalid or Expired
          </h2>
          <p className="text-gray-500 mb-4">
            The registration link you used is either invalid or has expired.
            Please request a new registration link or contact support for
            assistance.
          </p>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact support at{" "}
              <a
                href="mailto:support@saintcommunity.com"
                className="text-green-600 hover:underline"
              >
                support@saintcommunity.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-[375px] mx-auto bg-white py-[100px]">
      <h1 className="text-2xl font-bold">Workers Registration</h1>
      <p className="text-sm text-gray-500 mb-[36px]">
        Kindly fill the form below
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex-1 w-full space-y-4 p-4 md:px-0"
      >
        <div className="space-y-2">
          <form.Field name="profileImage">
            {(field) => {
              return (
                <div className="flex flex-col items-center gap-2">
                  <Label
                    htmlFor="photo-upload"
                    className={cn(
                      "flex flex-col items-center justify-center border border-dashed border-spacing-3 border-secondary w-full rounded-lg py-6  cursor-pointer hover:border-gray-400 transition-colors relative",
                      previewUrl && "hidden"
                    )}
                  >
                    <span className="text-black items-center gap-3 flex text-md">
                      <Upload color="red" /> Upload a photo
                    </span>

                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        field.handleChange(file);
                        setFile(file);
                      }}
                    />
                  </Label>
                  {file && (
                    <div className="flex flex-col items-center">
                      {previewUrl && (
                        <Avatar className="w-[100px] h-[100px] mt-12 mb-4">
                          <AvatarImage
                            src={previewUrl}
                            alt="Photo preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="mt-1 text-xs text-green-600 text-center truncate">
                        {/* {"name" in file ? file.name : ""} */}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-500 text-red-500 px-8 capitalize bg-white my-4"
                        onClick={() => {
                          // Trigger file input click to change photo
                          document.getElementById("photo-upload")?.click();
                        }}
                      >
                        Change photo
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
          </form.Field>
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="firstName"
            children={(field) => (
              <>
                <Input
                  id="firstName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="First Name"
                  className="h-[48px]"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Surname
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="lastName"
            children={(field) => (
              <>
                <Input
                  id="lastName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Surname"
                  className="h-[48px]"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="email"
            children={(field) => (
              <>
                <Input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter Email"
                  className="h-[48px]"
                />
                <FieldInfo field={field} />
                <em className="text-red-500 text-xs">
                  {errors?.email ? errors?.email : null}
                </em>
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Phone Number
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="phoneNumber"
            children={(field) => (
              <>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your Phone number"
                  className="h-[48px]"
                />
                <FieldInfo field={field} />
                <em className="text-red-500 text-xs">
                  {errors?.phone_number ? errors?.phone_number : null}
                </em>
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">
            Country
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="country"
            children={(field) => {
              return (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={(e) => {
                      field.handleChange(e);
                      setSelectedCountry(e);
                    }}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>

        {/* State select, depends on selected country */}
        <div className="space-y-2">
          <Label htmlFor="state">State/Province <RequiredAsterisk /></Label>
          <form.Field
            name="state"
            children={(field) => {
              return (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state, i) => (
                        <SelectItem key={i} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="homeAddress">
            Home Address
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="homeAddress"
            children={(field) => (
              <>
                <Textarea
                  rows={6}
                  id="homeAddress"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter home address"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workAddress">Work Address</Label>
          <form.Field
            name="workAddress"
            children={(field) => (
              <>
                <Textarea
                  rows={6}
                  id="workAddress"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter work address"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="flex flex-initial gap-2 w-full justify-between ">
          <div className="space-y-2 w-1/2">
            <Label htmlFor="gender">
              Gender
              <RequiredAsterisk />
            </Label>
            <form.Field
              name="gender"
              children={(field) => (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.id} value={gender.id}>
                          {gender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
          <div className="space-y-2 w-1/2">
            <Label htmlFor="dateOfBirth">
              Date of Birth
              <RequiredAsterisk />
            </Label>
            <br />
            <form.Field
              name="dateOfBirth"
              children={(field) => (
                <>
                  <DatePicker
                    value={field.state.value}
                    onChange={(date) => field.handleChange(date || new Date())}
                    className="h-[48px]"
                    captionLayout="dropdown"
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="church">Church</Label>
          <form.Field
            name="church"
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select a church" />
                  </SelectTrigger>
                  <SelectContent>
                    {[{ value: church?.id, label: church?.name }].map(
                      (church) => (
                        <SelectItem
                          key={church.value}
                          value={`${church.value}`}
                        >
                          {church.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fellowship">Fellowship <RequiredAsterisk /></Label>
          <form.Field
            name="fellowship"
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select a fellowship" />
                  </SelectTrigger>
                  <SelectContent>
                    {fellowships?.map(
                      (fellowship: { id: number; name: string }) => (
                        <SelectItem
                          key={fellowship.id}
                          value={`${fellowship.id}`}
                        >
                          {fellowship.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cell">Cell <RequiredAsterisk /></Label>
          <form.Field
            name="cell"
            children={(field) => (
              <>
               {isEmpty(cells) ? (
               null
               ) : <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select a cell" />
                  </SelectTrigger>
                  <SelectContent>
                    {cells?.map((cell: { id: number; name: string }) => (
                      <SelectItem key={cell.id} value={`${cell.id}`}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>}
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <form.Field
            name="department"
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(
                      (department: { value: string; label: string }) => (
                        <SelectItem
                          key={department.value}
                          value={`${department.value}`}
                        >
                          {department.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prayerGroup">
            Prayer Group Day <RequiredAsterisk />
          </Label>
          <form.Field
            name="prayerGroup"
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select a prayer group" />
                  </SelectTrigger>
                  <SelectContent>
                    {prayerGroups?.map(
                      (prayerGroup: { value: string; label: string }) => (
                        <SelectItem
                          key={prayerGroup.value}
                          value={`${prayerGroup.value}`}
                        >
                          {prayerGroup.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateJoinedChurch">
            Date you joined Church <RequiredAsterisk />
          </Label>
          <br />
          <form.Field
            name="dateJoinedChurch"
            children={(field) => (
              <>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date || new Date())}
                  className="h-[48px]"
                  captionLayout="dropdown"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateBecameWorker">
            Date you become a worker <RequiredAsterisk />
          </Label>
          <br />
          <form.Field
            name="dateBecameWorker"
            children={(field) => (
              <>
                <DatePicker
                  value={field.state.value}
                  onChange={(date) => field.handleChange(date || new Date())}
                  className="h-[48px]"
                  captionLayout="dropdown"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <div className="w-full ">
          <form.Subscribe
            selector={(state) => [state.canSubmit, mutation.isPending]}
            children={([canSubmit, isPending]) => (
              <Button
                type="submit"
                className="w-full h-[48px] mt-[36px]"
                disabled={!canSubmit}
                onClick={() => setErrors({})}
              >
                {isPending ? <Loader className="animate-spin" /> : "Submit"}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageMain />
    </Suspense>
  );
}
