"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "@workspace/ui/lib/sonner";
import { Loader2, Send } from "lucide-react";
import {
  createOnboardingAccount,
  createOnboardingCell,
  createOnboardingChurch,
  createOnboardingFellowship,
  finishOnboarding,
  getOnboardingDetails,
  sendTokenOnboardingInvite,
  type OnboardingRole,
} from "@/services/onboarding";
import countriesData from "@/utils/countries.json";

const CHURCH_NAME_PREFIX = "Saints Community Church ";
const meetingDays = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
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
  new Map(
    (countriesData as Country[]).map((country) => [country.name, country]),
  ).values(),
);

const defaultEntity = {
  name: "",
  country: "",
  state: "",
  area: "",
  address: "",
  meeting_days: "4",
  start_date: "",
};

function OnboardingWizard() {
  const token = useSearchParams().get("token") || "";
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [church, setChurch] = useState(defaultEntity);
  const [fellowship, setFellowship] = useState(defaultEntity);
  const [cell, setCell] = useState(defaultEntity);
  const [skipFellowship, setSkipFellowship] = useState(false);
  const [skipCell, setSkipCell] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMinistryName, setInviteMinistryName] = useState("");
  const [sentInvites, setSentInvites] = useState<
    Array<{ role: OnboardingRole; email: string; ministryName: string }>
  >([]);
  const [inviteRole, setInviteRole] =
    useState<OnboardingRole>("fellowship_leader");

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["onboarding", token],
    queryFn: () => getOnboardingDetails(token),
    enabled: !!token,
  });

  const onboarding = data?.data?.onboarding;
  const user = data?.data?.user;
  const createdChurch = data?.data?.church;
  const createdFellowship = data?.data?.fellowship;
  const createdCell = data?.data?.cell;
  const role = onboarding?.role as OnboardingRole | undefined;
  const inviteNameLabel =
    inviteRole === "church_pastor"
      ? "Church name"
      : inviteRole === "fellowship_leader"
        ? "Fellowship name"
        : "Cell name";

  useEffect(() => {
    if (onboarding?.email) {
      setAccount((current) => ({ ...current, email: onboarding.email }));
    }
  }, [onboarding?.email]);

  useEffect(() => {
    if (role === "fellowship_leader") {
      setInviteRole("cell_leader");
    }
  }, [role]);

  const stage = useMemo(() => {
    if (!user) return "account";
    if (role === "church_pastor" && !createdChurch) return "church";
    if (
      (role === "church_pastor" || role === "fellowship_leader") &&
      !createdFellowship &&
      ![
        "fellowship_skipped",
        "cell_created",
        "cell_skipped",
        "completed",
      ].includes(onboarding?.status)
    ) {
      return "fellowship";
    }
    if (
      !createdCell &&
      !["cell_skipped", "completed"].includes(onboarding?.status)
    )
      return "cell";
    return "invite";
  }, [
    createdCell,
    createdChurch,
    createdFellowship,
    onboarding?.status,
    role,
    user,
  ]);

  const accountMutation = useMutation({
    mutationFn: () => {
      if (account.password !== account.passwordConfirmation) {
        throw new Error("Passwords do not match");
      }

      return createOnboardingAccount(token, account);
    },
    onSuccess: () => {
      toast.success("Account created");
      refetch();
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create account",
      ),
  });

  const churchMutation = useMutation({
    mutationFn: () =>
      createOnboardingChurch(token, {
        ...church,
        name: church.name.startsWith(CHURCH_NAME_PREFIX)
          ? church.name
          : `${CHURCH_NAME_PREFIX}${church.name}`.trim(),
      }),
    onSuccess: () => {
      toast.success("Church created");
      refetch();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to create church"),
  });

  const fellowshipMutation = useMutation({
    mutationFn: () =>
      createOnboardingFellowship(token, {
        ...fellowship,
        meeting_days: Number(fellowship.meeting_days),
        skip: skipFellowship,
      }),
    onSuccess: () => {
      toast.success(
        skipFellowship ? "Fellowship skipped" : "Fellowship created",
      );
      refetch();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to save fellowship"),
  });

  const cellMutation = useMutation({
    mutationFn: () =>
      createOnboardingCell(token, {
        ...cell,
        meeting_days: Number(cell.meeting_days),
        skip: skipCell,
      }),
    onSuccess: () => {
      toast.success(skipCell ? "Cell skipped" : "Cell created");
      refetch();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to save cell"),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      sendTokenOnboardingInvite(token, {
        email: inviteEmail,
        role: inviteRole,
        ministry_name: inviteMinistryName,
        app_url: window.location.origin,
      }),
    onSuccess: () => {
      toast.success("Invite sent");
      setSentInvites((current) => [
        ...current,
        {
          role: inviteRole,
          email: inviteEmail,
          ministryName: inviteMinistryName,
        },
      ]);
      setInviteEmail("");
      setInviteMinistryName("");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to send invite"),
  });

  const finishMutation = useMutation({
    mutationFn: () => finishOnboarding(token),
    onSuccess: () => {
      toast.success("Onboarding completed");
      refetch();
    },
  });

  if (!token || error) {
    return (
      <CenteredMessage
        title="Invalid link"
        body="This onboarding link is invalid or expired."
      />
    );
  }

  if (isLoading) {
    return (
      <CenteredMessage
        title="Loading onboarding"
        body="Please wait..."
        loading
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <p className="text-sm font-medium text-[#705C2F]">
            Saints Community Church Portal
          </p>
          <h1 className="text-2xl font-semibold">Leaders Onboarding Form</h1>
          <p className="text-sm text-gray-500 capitalize">
            Role: {role?.replaceAll("_", " ")}
          </p>
        </div>

        <div key={stage} className="onboarding-step">
          {stage === "account" && (
            <OnboardingCard title="Create your account">
              <p>
                {" "}
                Please fill out these fields with valid details, you will need
                the credentials here to login to the portal
              </p>
              <Field
                label="Name"
                value={account.name}
                onChange={(name) => setAccount({ ...account, name })}
              />
              <Field
                label="Email"
                type="email"
                value={account.email}
                onChange={(email) => setAccount({ ...account, email })}
                disabled
              />
              <Field
                label="Password"
                type="password"
                value={account.password}
                onChange={(password) => setAccount({ ...account, password })}
              />
              <Field
                label="Confirm password"
                type="password"
                value={account.passwordConfirmation}
                onChange={(passwordConfirmation) =>
                  setAccount({ ...account, passwordConfirmation })
                }
              />
              <SubmitButton
                pending={accountMutation.isPending}
                onClick={() => accountMutation.mutate()}
              >
                Create account
              </SubmitButton>
            </OnboardingCard>
          )}

          {stage === "church" && (
            <OnboardingCard title="Create your church">
              <p>
                you are onboarding as a church pastor. please, enter the details
                of the church you directly oversee. <br /> The saints community
                church has already been prefixed, do not add it in the form. e.g
                Saints Community Church Isolo, only Isolo is expected
              </p>
              <EntityFields
                value={church}
                onChange={setChurch}
                includeMeetingDay={false}
                namePrefix={CHURCH_NAME_PREFIX}
              />
              <SubmitButton
                pending={churchMutation.isPending}
                onClick={() => churchMutation.mutate()}
              >
                Create church
              </SubmitButton>
            </OnboardingCard>
          )}

          {stage === "fellowship" && (
            <OnboardingCard title="Create the fellowship you pastor directly">
              {role !== "fellowship_leader" ? (
                <p>
                  If your church has a fellowship which you directly oversee,
                  please enter the details of the fellowship here, else, select
                  the "I do not pastor any fellowship button". <br />
                  e.g, Oke Afa Fellowship 1
                </p>
              ) : (
                <p></p>
              )}
              {role !== "fellowship_leader" ? (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={skipFellowship}
                    onCheckedChange={(checked) =>
                      setSkipFellowship(checked === true)
                    }
                  />
                  I do not pastor any fellowship directly
                </label>
              ) : (
                <p className="text-sm text-gray-500">
                  Fellowship leaders must create the fellowship they oversee.
                </p>
              )}
              {!skipFellowship && (
                <EntityFields value={fellowship} onChange={setFellowship} />
              )}
              <SubmitButton
                pending={fellowshipMutation.isPending}
                onClick={() => fellowshipMutation.mutate()}
              >
                {skipFellowship ? "Skip fellowship" : "Create fellowship"}
              </SubmitButton>
            </OnboardingCard>
          )}

          {stage === "cell" && (
            <OnboardingCard title="Create the cell you pastor directly">
              {role === "fellowship_leader" ? (
                <p>
                  If your fellowship has a cells and you pastor one directly,
                  please enter the details of the cell here, else, select the "I
                  do not pastor any cell button". <br />
                  e.g, Oke Afa Fellowship 1, cell 1
                </p>
              ) : null}
              {!createdFellowship && !onboarding?.parent_fellowship_id ? (
                <p className="text-sm text-gray-500">
                  A fellowship is required before creating a cell. This step can
                  be skipped.
                </p>
              ) : null}
              {role !== "cell_leader" ? (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={skipCell}
                    onCheckedChange={(checked) => setSkipCell(checked === true)}
                  />
                  I do not pastor any cell directly
                </label>
              ) : (
                <p className="text-sm text-gray-500">
                  Cell leaders must create the cell they oversee.
                </p>
              )}
              {!skipCell && <EntityFields value={cell} onChange={setCell} />}
              <SubmitButton
                pending={cellMutation.isPending}
                onClick={() => cellMutation.mutate()}
              >
                {skipCell ? "Skip cell" : "Create cell"}
              </SubmitButton>
            </OnboardingCard>
          )}

          {stage === "invite" && (
            <OnboardingCard title="Invite other leaders">
              {role === "church_pastor" ? (
                <p className="text-sm text-gray-500">
                  Here, you can send links to leaders within your church so they
                  can onboard.
                  <ul className="mt-10 text-white p-5 bg-slate-600 ">
                    <li className="mt-2">
                      Select the role of the leader you wish to add, if as a
                      Pastor, you have oversight over multiple churches, select
                      role "Church Pastor", enter the name of the church and the
                      email of the pastor overseeing the church and then click
                      send
                    </li>
                    <li className="mt-5">
                      As a church Pastor, Add only fellowship leaders under the
                      church you directly oversee. Do not add the fellowship you
                      oversee because that has been previously added
                    </li>
                    <li className="mt-5">
                      As a church Pastor, Add only cell leaders under the
                      fellowship you directly oversee. Do not add the cell you
                      oversee because that has been previously added
                    </li>
                  </ul>
                  <p className="p-3 bg-red-500 text-gray-100">
                    {" "}
                    Becareful not to click the "complete Onboarding" button till
                    you have added all leaders.
                  </p>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Here, you can send links to cell leaders under your fellowship
                  so they can onboard.
                  <ul className="mt-10 text-white p-5 bg-slate-600 ">
                    <li className="mt-2">Enter the name of the cell</li>
                    <li className="mt-2">
                      Enter the email of thr leader who pastors the cell
                    </li>
                    <li className="mt-2">
                      If you pastor a cell, do not send an invite to yourself,
                      as your cell has already been onboarded previously
                    </li>
                  </ul>
                  <p className="p-3 bg-red-500 text-gray-100">
                    {" "}
                    Becareful not to click the "complete Onboarding" button till
                    you have added all leaders.
                  </p>
                </p>
              )}
              {role === "church_pastor" ? (
                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as OnboardingRole)
                  }
                  className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="church_pastor">Church pastor</option>
                  <option value="fellowship_leader">Fellowship leader</option>
                  <option value="cell_leader">Cell leader</option>
                </select>
              ) : role === "fellowship_leader" ? (
                <select
                  value={
                    inviteRole === "church_pastor" ? "cell_leader" : inviteRole
                  }
                  onChange={(event) =>
                    setInviteRole(event.target.value as OnboardingRole)
                  }
                  className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="cell_leader">Cell leader</option>
                </select>
              ) : (
                <p className="text-sm text-gray-500">
                  Cell leaders cannot invite other leaders.
                </p>
              )}
              {role !== "cell_leader" && (
                <>
                  <Field
                    label={inviteNameLabel}
                    value={inviteMinistryName}
                    onChange={setInviteMinistryName}
                  />
                  <Field
                    label="Invite email"
                    type="email"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                  />
                  <SubmitButton
                    pending={inviteMutation.isPending}
                    onClick={() => {
                      if (!inviteMinistryName.trim() || !inviteEmail.trim()) {
                        toast.error(
                          "Please enter the name and email for this invite",
                        );
                        return;
                      }

                      if (
                        window.confirm(
                          `Send onboarding link for ${inviteMinistryName} to ${inviteEmail}?`,
                        )
                      ) {
                        inviteMutation.mutate();
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Send invite
                  </SubmitButton>
                  {sentInvites.length > 0 ? (
                    <div className="space-y-2 rounded-md border border-gray-200 p-3">
                      <p className="text-sm font-medium">Sent invites</p>
                      <div className="space-y-2">
                        {sentInvites.map((invite) => (
                          <div
                            key={`${invite.role}-${invite.email}-${invite.ministryName}`}
                            className="flex flex-col rounded-md bg-gray-50 p-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span>{invite.ministryName}</span>
                            <span className="text-gray-500">
                              {invite.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              <div className="mt-10 border-t border-gray-200 pt-5">
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => finishMutation.mutate()}
                >
                  Complete onboarding
                </Button>
              </div>
            </OnboardingCard>
          )}
        </div>
        <style jsx>{`
          .onboarding-step {
            animation: onboardingStepIn 520ms cubic-bezier(0.22, 1, 0.36, 1)
              both;
          }

          @keyframes onboardingStepIn {
            from {
              opacity: 0;
              transform: translateX(36px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </main>
  );
}

function CenteredMessage({
  title,
  body,
  loading,
}: {
  title: string;
  body: string;
  loading?: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      {loading ? (
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-gray-400" />
      ) : null}
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">{body}</p>
    </main>
  );
}

function OnboardingCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="space-y-4 p-5">
        <h2 className="text-lg font-medium">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function EntityFields({
  value,
  onChange,
  includeMeetingDay = true,
  namePrefix = "",
}: {
  value: typeof defaultEntity;
  onChange: (value: typeof defaultEntity) => void;
  includeMeetingDay?: boolean;
  namePrefix?: string;
}) {
  const stateOptions = useMemo(
    () =>
      countries.find((country) => country.name === value.country)?.states || [],
    [value.country],
  );
  const areaOptions = useMemo(() => {
    const selectedStateData = stateOptions.find(
      (state) => state.name === value.state,
    );
    const areas =
      selectedStateData?.subdivision ?? selectedStateData?.subdivisions ?? [];

    if (Array.isArray(areas)) {
      return areas;
    }

    return areas ? [areas] : [];
  }, [stateOptions, value.state]);

  return (
    <div className="space-y-4">
      {namePrefix ? (
        <div className="space-y-2">
          <Label>Name</Label>
          <div className="flex min-h-11 overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
              {namePrefix}
            </div>
            <Input
              className="h-11 rounded-none border-0 focus-visible:ring-0"
              value={value.name}
              onChange={(event) =>
                onChange({ ...value, name: event.target.value })
              }
            />
          </div>
        </div>
      ) : (
        <Field
          label="Name"
          value={value.name}
          onChange={(name) => onChange({ ...value, name })}
        />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          label="Country"
          value={value.country}
          placeholder="Select country"
          options={countries.map((country) => country.name)}
          onChange={(country) =>
            onChange({ ...value, country, state: "", area: "" })
          }
        />
        <SelectField
          label="State"
          value={value.state}
          placeholder="Select state"
          options={stateOptions.map((state) => state.name)}
          onChange={(state) => onChange({ ...value, state, area: "" })}
          disabled={!value.country}
        />
        <SelectField
          label="Area"
          value={value.area}
          placeholder="Select area"
          options={areaOptions}
          onChange={(area) => onChange({ ...value, area })}
          disabled={!value.state || areaOptions.length === 0}
        />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea
          value={value.address}
          onChange={(event) =>
            onChange({ ...value, address: event.target.value })
          }
        />
      </div>
      {includeMeetingDay && (
        <SelectField
          label="Meeting day"
          value={value.meeting_days}
          placeholder="Select meeting day"
          options={meetingDays}
          onChange={(meeting_days) => onChange({ ...value, meeting_days })}
        />
      )}
      <Field
        label="Start date"
        type="date"
        value={value.start_date}
        onChange={(start_date) => onChange({ ...value, start_date })}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { value: option, label: option }
                : option;

            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function SubmitButton({
  pending,
  onClick,
  children,
}: {
  pending: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button disabled={pending} onClick={onClick}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <CenteredMessage
          title="Loading onboarding"
          body="Please wait..."
          loading
        />
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
