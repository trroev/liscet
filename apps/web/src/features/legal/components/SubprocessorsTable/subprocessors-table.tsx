import {
  SUBPROCESSORS,
  SUBPROCESSORS_LAST_UPDATED,
} from "../../lib/subprocessors"

export const SubprocessorsTable = (): React.JSX.Element => (
  <div className="space-y-6">
    <p className="font-sans text-body-sm text-text-muted">
      Last updated: {SUBPROCESSORS_LAST_UPDATED}
    </p>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-body-sm">
        <thead>
          <tr className="border-border border-b">
            <th
              className="py-2 pr-4 font-semibold text-text-primary"
              scope="col"
            >
              Subprocessor
            </th>
            <th
              className="py-2 pr-4 font-semibold text-text-primary"
              scope="col"
            >
              Purpose
            </th>
            <th className="py-2 font-semibold text-text-primary" scope="col">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {SUBPROCESSORS.map((subprocessor) => (
            <tr className="border-border/50 border-b" key={subprocessor.name}>
              <td className="py-2 pr-4 font-medium text-text-primary">
                {subprocessor.name}
              </td>
              <td className="py-2 pr-4 text-text-secondary">
                {subprocessor.purpose}
              </td>
              <td className="py-2 text-text-secondary">
                {subprocessor.location}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
