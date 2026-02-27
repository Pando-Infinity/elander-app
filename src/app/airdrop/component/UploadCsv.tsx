/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  FC,
  useRef,
  useState,
  useEffect,
  ComponentPropsWithoutRef,
} from "react";
import { twMerge } from "tailwind-merge";
import { CsvIcon } from "@/components/icons";
import { AirdropInterface, CsvRow } from "../page";
import { validateSolWalletAddress } from "@/utils/blockchain.utils";
import Papa from "papaparse";

export interface ValidationResult {
  parsed: CsvRow[];
  errors: string[];
}

const UploadCsv: FC<UploadCsvProps> = ({
  errorMessage,
  airDropListByArray,
  airDropListByString,
  onErrorMessage,
  onAirDropListByString,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<AirdropInterface[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const validateAndParseData = (
    results: Papa.ParseResult<any>
  ): ValidationResult => {
    const parsed: CsvRow[] = [];
    const errors: string[] = [];

    results.data.forEach((row: any, index: number) => {
      if (!row || (Array.isArray(row) && row.every((cell: any) => !cell)))
        return;

      let address: string;
      let amount: string;

      if (Array.isArray(row)) {
        address = row[0]?.toString().trim() || "";
        amount = row[1]?.toString().trim() || "";
      } else {
        const keys = Object.keys(row);
        address = row[keys[0]]?.toString().trim() || "";
        amount = row[keys[1]]?.toString().trim() || "";
      }

      if (!address || !amount) {
        errors.push(`Line ${index + 1}: Missing address or amount`);
        return;
      }

      if (!validateSolWalletAddress(address)) {
        errors.push(`Line ${index + 1}: Invalid Solana address format`);
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push(`Line ${index + 1}: Amount must be a positive number`);
        return;
      }

      parsed.push({
        address,
        amount: numAmount.toString(),
        lineNumber: index + 1,
      });
    });

    return { parsed, errors };
  };

  const handleFileUpload = (file: File | null): void => {
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      onErrorMessage("Please upload a CSV file");
      return;
    }

    onErrorMessage("");

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const { parsed, errors } = validateAndParseData(results);

        if (errors.length > 0) {
          onErrorMessage(errors[0]);
          return;
        }

        if (parsed.length === 0) {
          onErrorMessage("No valid data found in CSV file");
          return;
        }

        setCsvData(parsed);
      },
      error: (error: Error) => {
        onErrorMessage(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleConvertCsvToString = () => {
    const result = csvData
      .map((item) => `${item.address},${item.amount}`)
      .join("\n");

    onAirDropListByString(result);
  };

  useEffect(() => {
    if (csvData.length === 0) return;
    handleConvertCsvToString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvData]);

  return (
    <div className="flex flex-col gap-y-3 items-center w-full">
      {airDropListByString ? (
        <textarea
          value={airDropListByString}
          className={twMerge(
            "rounded",
            "text-xs outline-none",
            "w-full min-h-[165px] sm:min-h-[186px] p-3 h-full",
            "bg-[#2A2A2A] border resize-y",
            errorMessage ? "border-[#F34E4E]/60" : "border-white/20"
          )}
          rows={airDropListByArray.length + 2}
          onChange={(e) => onAirDropListByString(e.target.value)}
        />
      ) : (
        <div
          className={twMerge(
            "min-h-[165px] sm:min-h-[186px] w-full rounded",
            "flex flex-col gap-y-5 items-center justify-center",
            "bg-[#2A2A2A] border border-dashed  cursor-pointer",
            errorMessage ? "border-[#F34E4E]/60" : "border-white/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <CsvIcon className="w-8 h-8 text-white/40" />
          <span className="flex flex-col items-center ">
            <p className="text-[10px] font-bold leading-[16px]">
              Click to select file, or drag and drop
            </p>
            <p className="text-[10px] text-white/20 leading-[24px]">
              Please ensure CSV file has one address per line
            </p>
          </span>
        </div>
      )}
      {errorMessage && (
        <p className="text-xs text-[#F34E4E]/60">{errorMessage}</p>
      )}
    </div>
  );
};

export default UploadCsv;

interface UploadCsvProps extends ComponentPropsWithoutRef<"div"> {
  errorMessage: string;
  airDropListByString: string;
  airDropListByArray: AirdropInterface[];

  onAirDropListByString: (airDropListByString: string) => void;
  onErrorMessage: (errorMessage: string) => void;
}
