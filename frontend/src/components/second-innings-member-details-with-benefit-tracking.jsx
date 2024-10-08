import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Home,
  Heart,
  Calendar,
  Edit,
  AlertCircle,
  BadgePercent,
  Activity,
  Gift,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePatient } from "../query/usePatient";
import { useGetAllAssignment } from "../query/useGetAllAssignment";
import { useGetPlanDetails } from "../query/useGetPlanDetails";
import ViewCallReports from "../routes/view-call-reports";
import { useEditPatient } from "../query/useEditPatient";
import toast from "react-hot-toast";

function calculateRenewalDate(createdAt, planDuration) {
  const createdDate = new Date(createdAt);
  let renewalDate;

  if (planDuration === "monthly") {
    renewalDate = new Date(createdDate.setMonth(createdDate.getMonth() + 1));
  } else {
    // Handle other plan durations if necessary
    renewalDate = createdDate;
  }

  return renewalDate.toISOString().split("T")[0];
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center mb-4">
    <Icon className="text-green-600 w-5 h-5 mr-2 flex-shrink-0" />
    <span className="text-sm text-green-800 font-medium mr-2">{label}:</span>
    <span className="text-sm text-gray-600">{value}</span>
  </div>
);

const ActivityItem = ({ date, activity }) => (
  <div className="flex items-center py-2 border-b border-green-100 last:border-b-0">
    <Calendar className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
    <span className="text-sm text-gray-600 mr-2">{date}</span>
    <span className="text-sm text-green-800">{activity}</span>
  </div>
);

const BenefitItem = ({ benefit, availableCount, onAvail, canAvail }) => (
  <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
    <div className="flex items-center">
      <Gift className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
      <span className="text-sm text-green-800">{benefit}</span>
    </div>
    <div className="flex items-center">
      <span className="text-sm text-gray-600 mr-2">
        Available: {availableCount}
      </span>
      <button
        onClick={onAvail}
        className={`bg-green-500 ${
          canAvail
            ? "cursor-not-allowed bg-slate-300"
            : "hover:bg-green-600 transition duration-300"
        } text-white px-2 py-1 rounded text-xs `}
      >
        Avail
      </button>
    </div>
  </div>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    className={`px-4 py-2 pb-3 font-medium rounded-t-lg ${
      active ? "bg-white text-green-800" : "bg-green-200 text-green-900"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default function ViewMemberDetails({ role }) {
  const { id } = useParams();
  const { isLoading, patient } = usePatient(id);
  const userData = JSON.parse(localStorage.getItem("userData")) || null;
  const [activeTab, setActiveTab] = useState("personal");
  const { isLoading: loadingAssignments, assignments } = useGetAllAssignment();
  const { isLoading: loadingPlan, plans } = useGetPlanDetails();
  const navigate = useNavigate();
  const { editPatient, isLoading: editing } = useEditPatient();
  const [benefits, setBenefits] = useState([
    { name: "24/7 Emergency Support", count: 2 },
    { name: "Monthly Health Check-ups", count: 12 },
    { name: "Personalized Care Plan", count: 1 },
    { name: "Home Care Services", count: 20 },
    { name: "Specialist Consultations", count: 4 },
  ]);

  const handleAvailBenefit = (index) => {
    const newBenefits = [...benefits];
    if (newBenefits[index].count > 0) {
      newBenefits[index].count -= 1;
      setBenefits(newBenefits);

      const today = new Date().toLocaleDateString();
      setActivities([
        { date: today, activity: `Availed: ${newBenefits[index].name}` },
        ...activities,
      ]);
    }
  };

  const [dataIndex, setDataIndex] = useState(null);

  if (isLoading || loadingAssignments || loadingPlan) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-green-50">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-green-500"></div>
        <span className="ml-2 text-green-800">Loading...</span>
      </div>
    );
  }

  // console.log("ye le meri detail", patient);
  console.log(patient.activities);

  console.log("ye le role", role);

  // console.log(patient.planDuration);

  const Assignments = assignments.filter(
    (assignment) => assignment.patient._id === id
  );

  const assessorAssignments = Assignments.filter(
    (assignment) => assignment.role === "Assessor"
  );

  const homeCareAssignments = Assignments.filter(
    (assignment) => assignment.role === "Home Care Staff"
  );

  const patientPlan = plans.filter((plan) => plan.plan === patient.plan)[0];

  console.log("ye le", patient._id);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">
          <button
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="w-6 h-6 text-green-800 mr-2" />
          </button>
          Member Details
        </h1>
        <button
          onClick={() => {
            navigate(`/${role}/edit-patient/${patient._id}`);
          }}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-green-700 text-white flex items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-4">
            <User className="w-12 h-12 text-green-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{patient.fullName}</h2>
            <p className="text-green-200">Member ID: {patient?.memberId}</p>
            <p className="text-green-200">{patient.plan} Plan</p>
          </div>
        </div>

        <div className="bg-green-200 p-3 pb-0 flex space-x-4">
          <TabButton
            active={activeTab === "personal"}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </TabButton>
          <TabButton
            active={activeTab === "membership"}
            onClick={() => setActiveTab("membership")}
          >
            Membership & Benefits
          </TabButton>
          <TabButton
            active={activeTab === "activities"}
            onClick={() => setActiveTab("activities")}
          >
            Activities
          </TabButton>
          {role === "admin-dashboard" && (
            <>
              <TabButton
                active={activeTab === "vitals"}
                onClick={() => setActiveTab("vitals")}
              >
                Vitals
              </TabButton>
              <TabButton
                active={activeTab === "callReports"}
                onClick={() => setActiveTab("callReports")}
              >
                Call Reports
              </TabButton>
              <TabButton
                active={activeTab === "assessor"}
                onClick={() => setActiveTab("assessor")}
              >
                Geriatic Assessment
              </TabButton>
            </>
          )}
        </div>

        <div className="p-6">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  Personal Information
                </h3>
                <InfoItem
                  icon={User}
                  label="Date of Birth"
                  value={patient.dob.split("T")[0]}
                />
                <InfoItem icon={Phone} label="Phone" value={patient.phone} />
                <InfoItem icon={Mail} label="Email" value={patient.email} />
                <InfoItem icon={Home} label="Address" value={patient.address} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  Emergency Contact
                </h3>
                <InfoItem
                  icon={User}
                  label="Name"
                  value={patient?.emergencyName}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={patient.emergencyContact}
                />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={patient?.emergencyEmail}
                />
              </div>
            </div>
          )}

          {activeTab === "membership" && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Membership Details
              </h3>
              <InfoItem icon={Heart} label="Plan" value={patient.plan} />
              <InfoItem
                icon={Calendar}
                label="Join Date"
                value={patient.createdAt.split("T")[0]}
              />
              <InfoItem
                icon={Calendar}
                label="Renewal Date"
                value={calculateRenewalDate(
                  patient.createdAt,
                  patient.planDuration
                )}
              />

              <h3 className="text-xl font-semibold text-green-800 mt-6 mb-4">
                Benefits
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                <BenefitItem
                  benefit="Annual Basic Health Checkup Package - 58 Parameters"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? 0
                      : patientPlan.annualBasicHealthCheckupPackage58Parameters) -
                    patient.benefits
                      .annualBasicHealthCheckupPackage_58Parameters
                  }
                  canAvail={
                    patientPlan.annualBasicHealthCheckupPackage58Parameters ===
                    (patient.planDuration === "monthly"
                      ? 0
                      : patientPlan.annualBasicHealthCheckupPackage58Parameters)
                  }
                  onAvail={() => {
                    if (
                      patientPlan.annualBasicHealthCheckupPackage58Parameters ===
                      (patient.planDuration === "monthly"
                        ? 0
                        : patientPlan.annualBasicHealthCheckupPackage58Parameters)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          annualBasicHealthCheckupPackage_58Parameters:
                            patient.benefits
                              .annualBasicHealthCheckupPackage_58Parameters + 1,
                        },
                        activity:
                          "Annual Basic Health Checkup Package - 58 Parameters",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="General Physician Doctor Consultation - In Person at Home"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear /
                            12
                        )
                      : patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear) -
                    patient.benefits
                      .generalPhysicianDoctorConsultation_InPersonatHome
                  }
                  canAvail={
                    patient.benefits
                      .generalPhysicianDoctorConsultation_InPersonatHome ===
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear /
                            12
                        )
                      : patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits
                        .generalPhysicianDoctorConsultation_InPersonatHome ===
                      (patient.planDuration === "monthly"
                        ? Math.floor(
                            patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear /
                              12
                          )
                        : patientPlan.generalPhysicianDoctorConsultationInPersonatHomePerYear)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          generalPhysicianDoctorConsultation_InPersonatHome:
                            patient.benefits
                              .generalPhysicianDoctorConsultation_InPersonatHome +
                            1,
                        },
                        activity:
                          "General Physician Doctor Consultation - In Person at Home",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="General Physician Doctor Consultation - Virtual"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth
                      : patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth *
                        12) -
                    patient.benefits.generalPhysicianDoctorConsultation_Virtual
                  }
                  canAvail={
                    patient.benefits
                      .generalPhysicianDoctorConsultation_Virtual ===
                    (patient.planDuration === "monthly"
                      ? patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth
                      : patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth *
                        12)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits
                        .generalPhysicianDoctorConsultation_Virtual ===
                      (patient.planDuration === "monthly"
                        ? patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth
                        : patientPlan.generalPhysicianDoctorConsultationVirtualPerMonth *
                          12)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          generalPhysicianDoctorConsultation_Virtual:
                            patient.benefits
                              .generalPhysicianDoctorConsultation_Virtual + 1,
                        },
                        activity:
                          "General Physician Doctor Consultation - Virtual",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="Super Specialist Consultation"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.superSpecialistConsultationPerYear / 12
                        )
                      : patientPlan.superSpecialistConsultationPerYear) -
                    patient.benefits.superSpecialistConsultation
                  }
                  canAvail={
                    patient.benefits.superSpecialistConsultation ===
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.superSpecialistConsultationPerYear / 12
                        )
                      : patientPlan.superSpecialistConsultationPerYear)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits.superSpecialistConsultation ===
                      (patient.planDuration === "monthly"
                        ? Math.floor(
                            patientPlan.superSpecialistConsultationPerYear / 12
                          )
                        : patientPlan.superSpecialistConsultationPerYear)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          superSpecialistConsultation:
                            patient.benefits.superSpecialistConsultation + 1,
                        },
                        activity: "Super Specialist Consultation",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="Wellness Call Check by MPG"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? patientPlan.WellnessCallCheckbyMPGPerMonth
                      : patientPlan.WellnessCallCheckbyMPGPerMonth * 12) -
                    patient.benefits.wellnessCallCheckbyMPG
                  }
                  canAvail={
                    patient.benefits.wellnessCallCheckbyMPG ===
                    (patient.planDuration === "monthly"
                      ? patientPlan.WellnessCallCheckbyMPGPerMonth
                      : patientPlan.WellnessCallCheckbyMPGPerMonth * 12)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits.wellnessCallCheckbyMPG ===
                      (patient.planDuration === "monthly"
                        ? patientPlan.WellnessCallCheckbyMPGPerMonth
                        : patientPlan.WellnessCallCheckbyMPGPerMonth * 12)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          wellnessCallCheckbyMPG:
                            patient.benefits.wellnessCallCheckbyMPG + 1,
                        },
                        activity: "Wellness Call Check by MPG",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="Vital Check at Home"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? Math.floor(patientPlan.VitalCheckatHomePerMonth)
                      : patientPlan.VitalCheckatHomePerMonth * 12) -
                    patient.benefits.vitalCheckatHome
                  }
                  canAvail={
                    patient.benefits.vitalCheckatHome ===
                    (patient.planDuration === "monthly"
                      ? Math.floor(patientPlan.VitalCheckatHomePerMonth)
                      : patientPlan.VitalCheckatHomePerMonth * 12)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits.vitalCheckatHome ===
                      (patient.planDuration === "monthly"
                        ? Math.floor(patientPlan.VitalCheckatHomePerMonth)
                        : patientPlan.VitalCheckatHomePerMonth * 12)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          id: patient._id,
                          vitalCheckatHome:
                            patient.benefits.vitalCheckatHome + 1,
                        },
                        activity: "Vital Check at Home",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="BLS Emergency Ambulance Evacuation Coverage (Within Patna)"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear /
                            12
                        )
                      : patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear) -
                    patient.benefits.BLSEmergencyAmbulanceEvacuationCoverage
                  }
                  canAvail={
                    patient.benefits.BLSEmergencyAmbulanceEvacuationCoverage ===
                    (patient.planDuration === "monthly"
                      ? Math.floor(
                          patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear /
                            12
                        )
                      : patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits
                        .BLSEmergencyAmbulanceEvacuationCoverage ===
                      (patient.planDuration === "monthly"
                        ? Math.floor(
                            patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear /
                              12
                          )
                        : patientPlan.BLSEmergencyAmbulanceEvacuationCoveragePerYear)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          BLSEmergencyAmbulanceEvacuationCoverage:
                            patient.benefits
                              .BLSEmergencyAmbulanceEvacuationCoverage + 1,
                        },
                        activity:
                          "BLS Emergency Ambulance Evacuation Coverage (Within Patna)",
                      });
                    }
                  }}
                />
                <BenefitItem
                  benefit="Free Dental & Eye Checkup"
                  availableCount={
                    (patient.planDuration === "monthly"
                      ? patientPlan.freeDentalAndEyeCheckupPerMonth
                      : patientPlan.freeDentalAndEyeCheckupPerMonth * 12) -
                    patient.benefits.freeDentalAndEyeCheckup
                  }
                  canAvail={
                    patient.benefits.freeDentalAndEyeCheckup ===
                    (patient.planDuration === "monthly"
                      ? patientPlan.freeDentalAndEyeCheckupPerMonth
                      : patientPlan.freeDentalAndEyeCheckupPerMonth * 12)
                  }
                  onAvail={() => {
                    if (
                      patient.benefits.freeDentalAndEyeCheckup ===
                      (patient.planDuration === "monthly"
                        ? patientPlan.freeDentalAndEyeCheckupPerMonth
                        : patientPlan.freeDentalAndEyeCheckupPerMonth * 12)
                    ) {
                      return toast.error("No Availability");
                    } else {
                      editPatient({
                        id: patient._id,
                        benefits: {
                          ...patient.benefits,
                          freeDentalAndEyeCheckup:
                            patient.benefits.freeDentalAndEyeCheckup + 1,
                        },
                        activity: "Free Dental & Eye Checkup",
                      });
                    }
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mt-6 mb-4">
                Discount
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Discount on Consultation (Online/Offline) after limit"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {
                        patientPlan.discountonConsultationOnlineOfflineafterlimitInPercent
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {
                        "Home Delivery of Medicine with Discount and No Delivery Charge"
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {
                        patientPlan.homeDeliveryofMedicinewithDiscountandNoDeliveryChargeInPercent
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {
                        "Discount on IPD Services - Total Bill *Not Applicable for Insurance"
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {
                        patientPlan.discountOnIPDServicesTotalBillNotApplicableforInsuranceInPercent
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {
                        "Discount on Diagnostics & Lab Services - Only for OPD Visits"
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {
                        patientPlan.discountOnDiagnosticsAndLabServicesOnlyForOPDVisitsInPercent
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Discount on Physiotherapy at Home"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {patientPlan.discountOnPhysiotherapyAtHome}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Nursing Care Services at Home"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {patientPlan.nursingCareServicesAtHomeInPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Home Sample Collection"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {patientPlan.homeSampleCollectionInPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Discount on Health Check"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {patientPlan.discountOnHealthCheckInPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <BadgePercent className="text-green-600 w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm text-green-800">
                      {"Discount on Eye/Dental/ENT/Skin Procedures"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {
                        patientPlan.discountOnEyeDentalENTSkinProceduresInPercent
                      }
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Recent Activities
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                {patient.activities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    date={new Date(activity.createdAt)
                      .toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace("am", "AM")
                      .replace("pm", "PM")}
                    activity={activity?.activities}
                  />
                ))}
              </div>
            </div>
          )}
          {activeTab === "vitals" && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Recent Activities
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                {homeCareAssignments.map((activity, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded px-4 hover:bg-green-300"
                    onClick={() => {
                      if (activity.status === "Completed")
                        navigate(
                          `/admin-dashboard/home-care-vitals-view/${activity._id}`
                        );
                    }}
                  >
                    <ActivityItem
                      date={activity.updatedAt.split("T")[0]}
                      activity={`${activity.staff.name} (${activity.status})`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "callReports" && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Recent Activities
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                {patient.callDetails?.map((activity, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded px-4 ${
                      index === dataIndex && "py-4"
                    } hover:bg-green-300`}
                    onClick={() => setDataIndex(index)}
                  >
                    <ActivityItem
                      date={activity?.reportData?.callDate}
                      activity={activity?.userData?.name}
                    />
                    {index === dataIndex && activity.reportData.callDate && (
                      <>
                        {/* Close button */}
                        <div
                          className="absolute z-50 right-3 top-3 px-4 py-1 rounded text-white bg-gray-900 text-lg font-bold cursor-pointer"
                          onClick={(e) => {
                            console.log("Clicked");
                            e.stopPropagation(); // Prevents the event from bubbling up
                            setDataIndex(null); // Reset the state
                          }}
                        >
                          close
                        </div>

                        {/* Modal overlay */}
                        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-60 flex justify-center items-center h-screen w-screen">
                          <ViewCallReports
                            data={activity}
                            setDataIndex={setDataIndex}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "assessor" && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                Recent Activities
              </h3>
              <div className="bg-green-50 rounded-md p-4">
                {assessorAssignments.map((activity, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded px-4 hover:bg-green-300"
                    onClick={() => {
                      if (activity.status === "Completed")
                        navigate(
                          `/admin-dashboard/view-geriatic-assesment/${activity._id}`
                        );
                    }}
                  >
                    <ActivityItem
                      date={activity.updatedAt.split("T")[0]}
                      activity={`${activity.staff.name} (${activity.status})`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
