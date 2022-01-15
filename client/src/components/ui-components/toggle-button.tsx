/* eslint-disable react/require-default-props */
import { useEffect, useState } from 'react';

interface ButtonProps {
  buttonLabel: string;
  buttonClass?: string;
  activeClass?: string;
  inactiveClass?: string;
  buttonState: boolean;
  onChange: any;
}

export default function ToggleButton({
  buttonLabel,
  buttonClass = 'text-white font-bold py-2 px-4 rounded-lg',
  activeClass = 'bg-green-700 hover:bg-green-900',
  inactiveClass = 'bg-indigo-600 hover:bg-indigo-800',
  buttonState,
  onChange,
}: ButtonProps) {
  const [internalButtonClass, setInternalButtonClass] = useState(buttonClass);

  useEffect(() => {
    const buttonClassModifier = buttonState ? activeClass : inactiveClass;
    setInternalButtonClass(`${buttonClass} ${buttonClassModifier}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonState]);

  return (
    <button
      type="button"
      className={internalButtonClass}
      onClick={() => onChange(!buttonState)}
    >
      {buttonLabel}
    </button>
  );
}
