"use client";

import { LoadingSwap } from "@/components/LoadingSwap";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import QrCode from "react-qr-code";

const twoFactorAuthSchema = z.object({
  password: z.string().min(1),
});

type TwoFactorAuthSchema = z.infer<typeof twoFactorAuthSchema>;
type TwoFactorData = {
  totpURI: string;
  backupCodes: string[];
};

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const router = useRouter();
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null
  );
  const form = useForm<TwoFactorAuthSchema>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: {
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleEnableTwoFactorAuth(data: TwoFactorAuthSchema) {
    const result = await authClient.twoFactor.enable({
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message || "faild to enable 2FA");
    } else {
      setTwoFactorData(result.data);
      form.reset();
    }
  }

  async function handleDisableTwoFactorAuth(data: TwoFactorAuthSchema) {
    await authClient.twoFactor.disable(
      {
        password: data.password,
      },
      {
        onSuccess: () => {
          form.reset();
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.error.message || "faild to disable 2FA");
        },
      }
    );
  }

  if (twoFactorData != null) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => {
          setTwoFactorData(null);
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(
          isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth
        )}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          variant={isEnabled ? "destructive" : "default"}
        >
          <LoadingSwap isLoading={isSubmitting}>
            {isEnabled ? "Disable 2FA" : "Enable 2FA"}
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const router = useRouter();
  const [successfullyEnable, setSuccessfullyEnabe] = useState(false);
  const form = useForm<QrForm>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      token: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleQrCode(data: QrForm) {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.token,
      },
      {
        onSuccess: () => {
          setSuccessfullyEnabe(true);
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.error.message || "faild to verify code");
        },
      }
    );
  }

  if (successfullyEnable) {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          Save these backup code in safe place. You can use them to access your
          account.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm">
              {code}
            </div>
          ))}
          <Button variant={"outline"} onClick={onDone}>
            Done
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Scan this QR code with your auhtenticator app and enter the code below
      </p>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>Submit Code</LoadingSwap>
          </Button>
        </form>
      </Form>
      <div className="p-4 bg-white w-fit">
        <QrCode size={256} value={totpURI} />
      </div>
    </div>
  );
}
