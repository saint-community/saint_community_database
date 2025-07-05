/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@workspace/ui/components/button";
import { useForm } from "@workspace/ui/lib/react-hook-form";
import { z } from "zod";
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
import { Suspense, useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
// import { cn } from "@workspace/ui/lib/utils";
// import { min } from "date-fns";

const formSchema = z.object({
  // photoUpload: z.string().optional(),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Surname must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  country: z.string().min(1, { message: "Please select a country" }),
  state: z.string(),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  church: z.string().min(1, {
    message: "Please select a church.",
  }),
  fellowship: z.string().min(1, {
    message: "Please select a fellowship.",
  }),
  cell: z.string().min(1, {
    message: "Please select a cell.",
  }),
  homeAddress: z.string().min(5, {
    message: "Please enter a valid home address.",
  }),
  workAddress: z.string(),
  dateOfBirth: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Please enter a valid date of birth.",
    }
  ),
  department: z.string(),
  prayerGroup: z.string().min(1, {
    message: "Please select a prayer group.",
  }),
  dateJoinedChurch: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Please enter a valid date.",
    }
  ),
  dateBecameWorker: z.date().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Please enter a valid date.",
    }
  ),
});

const genders = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
];

function RegisterPageMain() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data, error, isLoading } = useWorkerForm(token || "");
  const router = useRouter();

  // Import countries.json dynamically to avoid SSR issues
  const [countries, setCountries] = useState<{ code: string; name: string }[]>(
    []
  );
  useEffect(() => {
    import("@/utils/countries.json").then((mod) => {
      setCountries(mod.default || mod);
    });
  }, []);

  const demo = {
    church: {
      id: 1,
      name: "Isolo Church",
      country: "Nigeria",
      state: "Lagos",
      active: "yes",
      address: "20 street road, Lagos Nigeria",
      start_date: "2020-04-05",
    },
    fellowships: [
      {
        id: 1,
        name: "Isolo Fellowship 1",
        address: "Isolo oke afa",
        start_date: "2020-04-05",
      },
    ],
    cells: [
      {
        id: 1,
        name: "Isolo Fellowsip 1 cell 1",
        meeting_days: "4",
        address: "20 Isolo road, Lagos Nigeria",
        start_date: "2023-04-05",
      },
    ],
  };

  const user = data?.data?.user?.user;
  const church = demo?.church;
  const fellowships = demo?.fellowships;
  const cells = demo?.cells;
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

  const mutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      toast.success("Account created successfully");
      form.reset();
      router.push("/completed");
    },
    onError: () => {
      toast.error("Failed to create account");
    },
  });

  const form = useForm({
    defaultValues: {
      // photoUpload: null as File | null,
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
      dateOfBirth: new Date(),
      department: "",
      dateJoinedChurch: new Date(),
      prayerGroup: "",
      dateBecameWorker: new Date(),
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle form submission here

      mutation.mutate({
        church_id: Number(value.church),
        fellowship_id: Number(value.fellowship),
        cell_id: Number(value.cell),
        first_name: value.firstName || "",
        last_name: value.lastName || "",
        dob: value.dateOfBirth.toISOString().split("T")[0],
        gender: value.gender,
        status: "worker",
        phone_number: value.phoneNumber,
        email: value.email,
        facebook_username: "",
        twitter_username: "",
        instagram_username: "",
        house_address: value.homeAddress,
        work_address: value.workAddress,
        member_since: value.dateJoinedChurch.toISOString().split("T")[0],
        worker_since: value.dateJoinedChurch.toISOString().split("T")[0],
        active: true,
        prayer_group_id: value.prayerGroup,
        department_id: value.department ? Number(value.department) : undefined,
        country: value.country,
        state: value.state,
        date_joined_church: value.dateJoinedChurch.toISOString().split("T")[0],
        date_became_worker: value.dateBecameWorker.toISOString().split("T")[0],
      });
    },
    onSubmitInvalid(props) {
      console.log(props);
    },
  });

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen max-w-[375px] mx-auto bg-white">
        <Loader className="w-12 h-12 animate-spin mb-4 text-gray-400" />
        <span className="text-gray-500">Hang tight, we're loading 🚀</span>
      </div>
    );
  }
  if (!token || error) {
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
        {/* <div className="space-y-2">
          <form.Field name="photoUpload">
            {(field) => {
              const file = field.state.value as File | null;

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
                        file && field.handleChange(file);
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
                        {"name" in file ? file.name : ""}
                      </span>
                      <Button
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
        </div> */}
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
          <Label htmlFor="state">State/Province</Label>
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

        <div className="flex gap-2 w-full justify-between items-center">
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
                    {[{ value: church?.id, label: church?.name }]?.map(
                      (church: { value: number; label: string }) => (
                        <SelectItem
                          key={church.value || ""}
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
          <Label htmlFor="fellowship">Fellowship</Label>
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
          <Label htmlFor="cell">Cell</Label>
          <form.Field
            name="cell"
            children={(field) => (
              <>
                <Select
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
                </Select>
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
