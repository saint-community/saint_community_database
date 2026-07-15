/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@workspace/ui/components/button";
import { useForm, useStore } from "@workspace/ui/lib/react-hook-form";
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
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
import countriesData from "@/utils/countries.json";

const currentDate = new Date().toISOString();


const genders = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
];

const workerStatuses = [
  { id: "worker", name: "Worker" },
  { id: "cell_leader", name: "Cell Leader" },
  { id: "fellowship_leader", name: "Fellowship Leader" },
  { id: "church_pastor", name: "Church Pastor" },
  { id: "pastor", name: "Pastor" },
  { id: "LMA", name: "LMA" },
];

type Country = {
  name: string;
  states?: Array<{
    name: string;
    subdivision?: string[] | string | null;
    subdivisions?: string[] | string | null;
  }>;
};

const countries = Array.from(
  new Map((countriesData as Country[]).map((country) => [country.name, country])).values()
);

const TERMS_VERSION = "terms-v1";
const PRIVACY_POLICY_VERSION = "privacy-v1";

function RegisterPageMain() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data, error, isLoading } = useWorkerForm(token || "");
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const RequiredAsterisk = () => <span className="text-rose-500">*</span>;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const stateOptions = useMemo(
    () => countries.find((country) => country.name === selectedCountry)?.states || [],
    [selectedCountry]
  );

  const areaOptions = useMemo(() => {
    const selectedStateData = stateOptions.find(
      (state) => state.name === selectedState
    );
    const areas =
      selectedStateData?.subdivision ?? selectedStateData?.subdivisions ?? [];

    if (Array.isArray(areas)) {
      return areas;
    }

    return areas ? [areas] : [];
  }, [selectedState, stateOptions]);

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
      const fellowships = data?.data?.churchInformation?.fellowships || [];
      const cells = data?.data?.churchInformation?.cells || [];

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
      area: "",
      email: "",
      gender: "",
      status: "worker",
      phoneNumber: "",
      church: church?.id?.toString() || "",
      fellowship: fellowships?.[0]?.id?.toString() || "",
      cell: "",
      homeAddress: "",
      workAddress: "",
      dateOfBirth: dayjs(currentDate).subtract(7, "years").toDate(),
      department: "",
      dateJoinedChurch: dayjs(currentDate).subtract(7, "days").toDate(),
      prayerGroup: "",
      dateBecameWorker: dayjs(currentDate).subtract(7, "days").toDate(),
      termsAccepted: false,
      privacyAcknowledged: false,
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
      formData.append(
        "date_of_birth",
        value.dateOfBirth.toISOString().split("T")[0] ?? ""
      );
      formData.append("gender", value.gender);
      formData.append("status", value.status);
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
      formData.append("area", value.area || "");
      formData.append(
        "date_joined_church",
        value.dateJoinedChurch.toISOString().split("T")[0] ?? ""
      );
      formData.append(
        "date_became_worker",
        value.dateBecameWorker.toISOString().split("T")[0] ?? ""
      );
      formData.append("terms_accepted", value.termsAccepted ? "1" : "0");
      formData.append(
        "privacy_acknowledged",
        value.privacyAcknowledged ? "1" : "0"
      );
      formData.append("terms_version", TERMS_VERSION);
      formData.append("privacy_policy_version", PRIVACY_POLICY_VERSION);

      mutation.mutate(formData);
    } ,
  });

  const selectedFellowshipId = useStore(
    form.store,
    (state) => state.values.fellowship
  );

  const filteredCells = useMemo(
    () =>
      cells.filter(
        (cell: { fellowship_id?: number | string }) =>
          String(cell.fellowship_id) === String(selectedFellowshipId)
      ),
    [cells, selectedFellowshipId]
  );

  useEffect(() => {
    form.setFieldValue("church", church?.id?.toString() || "");
    if (fellowships.length === 1) {
      form.setFieldValue("fellowship", fellowships[0]?.id?.toString() || "");
    }
  }, [church?.id, fellowships, form]);

  useEffect(() => {
    if (!selectedFellowshipId) {
      form.setFieldValue("cell", "");
      return;
    }

    const currentCellBelongsToFellowship = filteredCells.some(
      (cell: { id: number | string }) =>
        String(cell.id) === String(form.state.values.cell)
    );

    if (!currentCellBelongsToFellowship) {
      form.setFieldValue(
        "cell",
        filteredCells.length === 1 ? String(filteredCells[0]?.id || "") : ""
      );
    }
  }, [filteredCells, form, selectedFellowshipId]);

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
                      setSelectedState("");
                      form.setFieldValue("state", "");
                      form.setFieldValue("area", "");
                    }}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.name} value={country.name}>
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
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setSelectedState(value);
                      form.setFieldValue("area", "");
                    }}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((state) => (
                        <SelectItem key={state.name} value={state.name}>
                          {state.name}
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
          <Label htmlFor="area">Area</Label>
          <form.Field
            name="area"
            children={(field) => {
              return (
                <>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={!selectedState || areaOptions.length === 0}
                  >
                    <SelectTrigger className="h-[48px]">
                      <SelectValue placeholder="Select an area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaOptions.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
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
          <Label htmlFor="status">
            Status
            <RequiredAsterisk />
          </Label>
          <form.Field
            name="status"
            children={(field) => (
              <>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    const fellowshipCells = cells.filter(
                      (cell: { fellowship_id?: number | string }) =>
                        String(cell.fellowship_id) === String(value)
                    );
                    form.setFieldValue(
                      "cell",
                      fellowshipCells.length === 1
                        ? String(fellowshipCells[0]?.id || "")
                        : ""
                    );
                  }}
                >
                  <SelectTrigger className="h-[48px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {workerStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
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

        {!isEmpty(filteredCells) && (
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
                      {filteredCells?.map((cell: { id: number; name: string }) => (
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
        )}

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
        <div className="space-y-3 rounded-md border border-gray-200 p-3">
          <form.Field
            name="termsAccepted"
            children={(field) => (
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <Label
                    htmlFor="termsAccepted"
                    className="text-sm font-normal leading-5"
                  >
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setTermsOpen(true);
                      }}
                      className="font-medium text-[#705C2F] underline underline-offset-2"
                    >
                      Terms and Conditions
                    </button>
                    .
                    <RequiredAsterisk />
                  </Label>
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />
          <form.Field
            name="privacyAcknowledged"
            children={(field) => (
              <div className="space-y-1">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacyAcknowledged"
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <Label
                    htmlFor="privacyAcknowledged"
                    className="text-sm font-normal leading-5"
                  >
                    I acknowledge the{" "}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                      className="font-medium text-[#705C2F] underline underline-offset-2"
                    >
                      Privacy Policy
                    </button>
                    .
                    <RequiredAsterisk />
                  </Label>
                </div>
                <FieldInfo field={field} />
              </div>
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
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[85vh] max-w-[92vw] overflow-hidden bg-white p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-gray-200 px-5 py-4">
            <DialogTitle>Terms and Conditions</DialogTitle>
          </DialogHeader>
          <iframe
            title="Terms and Conditions"
            src="/terms"
            className="h-[72vh] w-full border-0"
          />
        </DialogContent>
      </Dialog>
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-h-[85vh] max-w-[92vw] overflow-hidden bg-white p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-gray-200 px-5 py-4">
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <iframe
            title="Privacy Policy"
            src="/privacy-policy"
            className="h-[72vh] w-full border-0"
          />
        </DialogContent>
      </Dialog>
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
