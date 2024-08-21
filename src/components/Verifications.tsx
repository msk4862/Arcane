import { Verification } from "../types";
import { Switch } from "./Switch";

interface Props {
  verifications: Verification[];
  onChange: (v: Verification[]) => void;
}

export const Verifications: React.FC<Props> = ({ verifications, onChange }) => {
  const handleChange = (vIndex: number, cIndex: number, value: boolean) => {
    /**
     * Problem:
     * `const updatedVerification = structuredClone(verifications);`
     *
     * `structuredClone` works on principle that if Object.is(orgObj.field1, orgObj.field2) is true then
     * Object.is(cloneObj.field1, cloneObj.field2) should also be true.
     *
     * Hence, in our case where few eligibility `check` object of different sources have the same object reference then it will be same in the cloned object as well, hence causing the issue.
     */

    /**
     * Solution 1: Using JSON.parse and JSON.stringify to clone the object.
     *
     * const updatedVerification = JSON.parse(JSON.stringify(verifications));
     * updatedVerification[vIndex].eligibility.checks[cIndex].passed = value;
     */

    /**
     * Solution 2: Using the spread operator to clone and update the object.
     */

    const updatedVerification = verifications.map((verification, verIndex) => {
      if (verIndex !== vIndex) return verification;

      return {
        ...verification,
        eligibility: {
          ...verification.eligibility,
          checks: verification.eligibility.checks.map((check, checkIndex) => {
            if (checkIndex !== cIndex) return check;
            return { ...check, passed: value };
          }),
        },
      };
    });

    onChange(updatedVerification);
  };

  return (
    <>
      {verifications.map((verification, vIndex) => {
        return (
          <div key={vIndex} className="mt-6">
            <div className="text-xs px-3 py-1 bg-white rounded-full mb-1 font-medium text-neutral-400 inline-block">
              {" "}
              Verification Source: {verification.source}
            </div>
            <div className="flex flex-wrap">
              {verification.eligibility.checks.map((condition, cIndex) => {
                return (
                  <div
                    className="p-px w-1/2"
                    /**
                     * Problem (Unrelated to Switch issue):
                     * `key={condition.name}`
                     *
                     * For different sources, the condition name can be same as well, hence use of same key for different child elements.
                     */

                    /**
                     * Solution:
                     * We should use unique key for each child element
                     */
                    key={`${verification.source}-${condition.name}`}
                  >
                    <div
                      /**
                       * Problem (Unrelated to Switch issue):
                       *
                       * No need of `key` prop here as this is not a list element.
                       */
                      key={condition.name}
                      className="flex flex-col bg-white p-4 rounded-lg"
                    >
                      <p className="text-sm font-medium text-neutral-700 mb-1 -mt-1">
                        {condition.label}
                      </p>
                      <Switch
                        checked={condition.passed}
                        onChange={() => {
                          handleChange(vIndex, cIndex, !condition.passed);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
