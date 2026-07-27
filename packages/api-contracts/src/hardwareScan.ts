export function isNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export async function readNfcPayload(timeoutMs = 15000): Promise<string> {
  if (!isNfcSupported()) {
    throw new Error("NFC is not supported on this device.");
  }

  const ndef = new (window as unknown as { NDEFReader: new () => NDEFReaderLike }).NDEFReader();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await ndef.scan({ signal: controller.signal });

    return new Promise<string>((resolve, reject) => {
      const reader = ndef as NDEFReaderLike;
      reader.addEventListener(
        "reading",
        (event: unknown) => {
          clearTimeout(timeout);
          const readingEvent = event as NdefReadingEventLike;
          for (const record of readingEvent.message.records) {
            if (record.recordType === "text") {
              const encoding = (record as NdefTextRecordLike).encoding || "utf-8";
              resolve(new TextDecoder(encoding).decode(record.data));
              return;
            }
            if (record.recordType === "url") {
              resolve(new TextDecoder().decode(record.data));
              return;
            }
          }
          reject(new Error("NFC tag did not contain a readable text or URL payload."));
        },
        { once: true },
      );

      reader.addEventListener(
        "readingerror",
        () => {
          clearTimeout(timeout);
          reject(new Error("Failed to read the NFC tag."));
        },
        { once: true },
      );
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Default service/characteristic used by SpottGeo BLE beacons to broadcast a payload.
const DEFAULT_BEACON_SERVICE_UUID = "0000180a-0000-1000-8000-00805f9b34fb";
const DEFAULT_BEACON_CHARACTERISTIC_UUID = "00002a29-0000-1000-8000-00805f9b34fb";

export async function readBluetoothBeaconPayload(
  serviceUuid = DEFAULT_BEACON_SERVICE_UUID,
  characteristicUuid = DEFAULT_BEACON_CHARACTERISTIC_UUID,
  timeoutMs = 20000,
): Promise<string> {
  if (!isBluetoothSupported()) {
    throw new Error("Bluetooth is not supported on this device.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const device = await (navigator as unknown as NavigatorLike).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [serviceUuid],
    });

    if (controller.signal.aborted) {
      throw new Error("Bluetooth scan timed out.");
    }

    const server = await device.gatt?.connect();
    if (!server) throw new Error("Could not connect to the Bluetooth beacon.");

    const service = await server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);
    const value = await characteristic.readValue();

    return new TextDecoder("utf-8").decode(value);
  } finally {
    clearTimeout(timeout);
  }
}

// Minimal ambient type shims so we do not need experimental @types packages.
interface NDEFReaderLike {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  addEventListener: (
    type: string,
    listener: (event: unknown) => void,
    options?: { once?: boolean },
  ) => void;
}

interface NdefReadingEventLike {
  message: {
    records: Array<{
      recordType: string;
      data: BufferSource;
    }>;
  };
}

interface NdefTextRecordLike {
  encoding?: string;
}

interface NavigatorLike {
  bluetooth: {
    requestDevice(options: {
      acceptAllDevices: boolean;
      optionalServices: string[];
    }): Promise<BluetoothDeviceLike>;
  };
}

interface BluetoothDeviceLike {
  gatt?: {
    connect(): Promise<BluetoothRemoteGATTServerLike>;
  };
}

interface BluetoothRemoteGATTServerLike {
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTServiceLike>;
}

interface BluetoothRemoteGATTServiceLike {
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristicLike>;
}

interface BluetoothRemoteGATTCharacteristicLike {
  readValue(): Promise<DataView>;
}
