import React, { useEffect, useState } from "react";
import { Steps, Button, message } from "antd";

import AppointmentSpecialty from "../Specialty";
import AppointmentDoctor from "../Doctor";
import AppointmentSchedule from "../Schedule";
import { getStepByServiceId } from "../../../services/appointmentService";
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PaymentMethod from "../PaymentMethod";

const { Step } = Steps;

export default function UserBookingFlow() {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hospitalId = searchParams.get("hospitalId");
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName");
  const hospitalName = searchParams.get("hospitalName");
 
  const location = useLocation();
  useEffect(() => {
    console.log("Location: ", location);
    if (location.state?.stepData) {
      setStepData(location.state.stepData);
    }
    if (location.state?.backToStepIndex !== undefined) {
      setCurrentStepIndex(location.state.backToStepIndex);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchSteps = async () => {
      const rawSteps = await getStepByServiceId(serviceId);
      const filtered = rawSteps
        .filter(s => s.status === true)
        .sort((a, b) => a.stepOrder - b.stepOrder);
      setSteps(filtered);
    };

    fetchSteps();
  }, [serviceId]);

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleNextStep = (result) => {
    const updatedStepData = {
      ...stepData,
      ...result,
      serviceId,
      serviceName,
      hospitalName,
      hospitalId
    };

    setStepData(updatedStepData);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      navigate("/appointment/accept-infomation", {
        state: {
          hospitalName,
          stepData: {
            ...updatedStepData
          }
        }
      });
    }
  };

  const renderCurrentStep = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;
    const stepType = currentStep.steps.stepType;
    const commonProps = {
      onNext: handleNextStep,
      onBack: handlePrevStep,
      defaultValue: stepData,
      infomationValue: {
        hospitalId,
        serviceId,
        serviceName,
        hospitalName,
      }
    };

    switch (stepType) {
      case 1:
        return <AppointmentSpecialty {...commonProps} />;
      case 2:
        return <AppointmentDoctor {...commonProps} />;
      case 3:
        return <AppointmentSchedule {...commonProps} />;
      case 4:
        return <PaymentMethod {...commonProps} />;
      default:
        return <div>Không xác định bước này</div>;
    }
  };

  return (
    <div style={{ marginTop: 50, paddingTop: 50, background: '#eaf8ff', minHeight:700 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems:"center" }}>
        <Steps current={currentStepIndex} style={{ width: "70%" }}>
          {steps.map((s, i) => (
            <Step key={i} title={s.steps.name} />
          ))}
        </Steps>
      </div>

      <div>{renderCurrentStep()}</div>
    </div>
  );
}
