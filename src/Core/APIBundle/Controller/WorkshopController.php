<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Leon Bergmann, Martin Griebel, Andreas Ifland, Marco Hanisch
 * Date: 29.04.2016
 * Time: 16:44
 */
namespace Core\APIBundle\Controller;

use Core\EntityBundle\Entity\Participants;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;
use JMS\Serializer\SerializationContext;
use Core\EntityBundle\Entity\Workshop;
use Core\EntityBundle\Entity\WorkshopParticipants;
use Core\EntityBundle\Entity\EmailToken;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Routing\ClassResourceInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class RestController.
 * This Controller provides the methods for the public part of the website.
 * @Rest\RouteResource("Workshops")
 */
class WorkshopController extends FOSRestController implements ClassResourceInterface
{
    /**
     * Returns list of all Workshops that are active
     * @ApiDoc(
     *  resource=true,
     *  description="Returns list of all Workshops that are active",
     *  output = "Core\EntityBundle\Entity\Workshop",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      204 = "Returned when the data is not found"
     *  }
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getAllAction()
    {
        $workshopRepo = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Workshop');
        $workshops = $workshopRepo->getAllActiveWorkshops();
        if (!$workshops) {
            return $this->handleView($this->view(['code' => 204, 'message' => "No workshop was found"], 204));
        }
        $view = $this->view($workshops, 200);
        return $this->handleView($view);
    }

    /**
     * Returns Details of a Workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Returns Details of a Workshop",
     *  output = "Core\EntityBundle\Entity\Workshop",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="which workshop to display"
     *      }
     *  }
     * )
     *
     * @param $id id of a workshop
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getAction($id)
    {
        $workshop = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Workshop')->find($id);
        if (!$workshop) {
            return $this->handleView($this->view(['code' => 404, 'message' => "This workshop was not found"], 404));
        } else {
            $view = $this->view($workshop, 200);
            return $this->handleView($view);
        }
    }

    /**
     * Action to enroll on a Workshop.
     * @ApiDoc(
     *  resource=true,
     *  description="Action to enroll on a Workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\RequestParam(name="name", requirements=".*", description="name of the participant")
     * @Rest\RequestParam(name="surname", requirements=".*", description="surname of the participant")
     * @Rest\RequestParam(name="email", requirements=".*", description="email of the participant")
     *
     * @param $id int id of the workshop the user wants to enroll
     * @param $paramFetcher ParamFetcher Helper to get the params from the post request
     * @Rest\View()
     */
    public function postEnrollAction($id, ParamFetcher $paramFetcher)
    {
        $params = $paramFetcher->all();

        $workshop = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->find($id);
        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->findOneBy(
            ["email" => $params["email"]]
        );

        if (!$workshop) {
            return $this->handleView($this->view(['code' => 404, 'message' => "Workshop not found"], 404));
        }

        if ($participant == null) {
            $participant = new Participants();
            $participant->setBlacklisted(false);
            $participant->setEmail($params["email"]);
            $participant->setName($params["name"]);
            $participant->setSurname($params["surname"]);

            $this->getDoctrine()->getManager()->persist($participant);
            $this->getDoctrine()->getManager()->flush();

        } else {
            //all workshops which the user were not participating yet
            if ($participant->isBlacklisted()) {
                return $this->handleView($this->view(['code' => 403, 'message' => "ALERT_YOU_ARE_ON_BLACKLIST"], 403));
            }

            $workshopParticipants = $this->getDoctrine()->getRepository(
                "CoreEntityBundle:WorkshopParticipants"
            )->findBy(["participant" => $participant, "participated" => 0]);
            //load workshop with start and endtim, iterate over all
            foreach ($workshopParticipants as $tupel) {
                if ($workshop->getStartAt() >= $tupel->getWorkshop()->getStartAt() && $workshop->getEndAt(
                    ) <= $tupel->getWorkshop()->getEndAt()
                ) {
                    if ($workshop->getId() == $tupel->getWorkshop()->getId()) {
                        return $this->handleView(
                            $this->view(['code' => 403, 'message' => "ALERT_ALREADY_ENROLLED"], 403)
                        );
                    } else {
                        return $this->handleView(
                            $this->view(['code' => 403, 'message' => "ALERT_WORKSHOP_AT_SAME_TIME"], 403)
                        );
                    }

                }
            }
        }

        $token = new EmailToken();
        $token->setParticipant($participant);
        $this->getDoctrine()->getManager()->persist($token);
        $this->getDoctrine()->getManager()->flush();

        $url = $this->generateUrl('core_frontend_default_index', [], true) . "#/enrollment/confirm/" . $workshop->getId(
            ) . "/" . $participant->getId() . "/" . $token->getToken();
        $unsubscribe = $this->generateUrl(
                'core_frontend_default_index',
                [],
                true
            ) . "#/unsubscribe/" . $workshop->getId() . "/" . $participant->getId();
        //load Template for conferment
        $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->findOneBy(
            ['template_name' => 'Enrollment']
        );
        /* Creating Twig template from Database */
        $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
        /* Sending E-Mail with Confirmation Link*/
        $message = \Swift_Message::newInstance()
            ->setSubject(
                $this->get('twig')->createTemplate($template->getEmailSubject())->render(["workshop" => $workshop])
            )
            ->setFrom($this->getParameter('email_sender'))
            ->setTo($participant->getEmail())
            ->setBody(
                $renderTemplate->render(
                    [
                        "workshop"    => $workshop,
                        "participant" => $participant,
                        'url'         => $url,
                        'unsubscribe' => $unsubscribe
                    ]
                ),
                'text/html'
            );
        $this->get('mailer')->send($message);

        return View::create(null, Codes::HTTP_OK);
    }

    /**
     * Action to confirm enrollment on a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Action to confirm enrollment on a workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      401 = "Return when errors at content level",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @param  $workshopId int id of the workshop
     * @param  $participantsId int id of the participant
     * @param  $token string token to identify the participant
     * @Rest\View()
     */
    public function getEnrollConfirmAction($workshopId, $participantsId, $token)
    {
        $workshopParticipant = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findOneBy(['workshop' => $workshopId, 'participant' => $participantsId]);
        if ($workshopParticipant) {
            return $this->handleView($this->view(['code' => 403, 'message' => "ALERT_ALREADY_ENROLLED"], 403));

        }

        $workshop = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Workshop")->find($workshopId);
        $token = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:EmailToken")->findOneBy(
            ['token' => $token]
        );
        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->find(
            $participantsId
        );

        // Workshop & Token & participant are valid
        if ($workshop != null && $token != null && $participant != null) {
            // Check if Token is not older then 30 min
            if ($token->getValidUntil() >= new \DateTime('now') && $token->getUsedAt() == null) {
                // Check if this token is dedicated to user
                if ($token->getParticipant() != $participant) {
                    return $this->handleView($this->view(['code' => 403, 'message' => "User does not match"], 403));
                } else {
                    $participantWorkshop = new WorkshopParticipants();
                    $participantWorkshop->setWorkshop($workshop);
                    $participantWorkshop->setParticipant($participant);
                    $participantWorkshop->setEnrollment(new \DateTime('now'));
                    $participantWorkshop->setParticipated(false);
                    // Get Participants
                    $participants = $this->getDoctrine()->getManager()->getRepository(
                        "CoreEntityBundle:Workshop"
                    )->getParticipants($workshopId);
                    // Check if a waitinglist ist requiered
                    if ($workshop->getMaxParticipants() > $participants) {
                        $participantWorkshop->setWaiting(false);
                    } else {
                        $participantWorkshop->setWaiting(true);
                    }
                    $token->setUsedAt(new \DateTime('now'));
                    // save to database
                    $this->getDoctrine()->getManager()->persist($token);
                    $this->getDoctrine()->getManager()->persist($participantWorkshop);
                    $this->getDoctrine()->getManager()->flush();
                    //
                    if ($participantWorkshop->isWaiting()) {
                        return $this->handleView(
                            $this->view(['code' => 201, 'message' => 'You are on the waiting list'], 201)
                        );
                    } else {
                        return $this->handleView($this->view(['code' => 200, 'message' => $workshop->getTitle()], 200));
                    }
                }
            } else {
                return $this->handleView($this->view(['code' => 403, 'message' => "Token ist not valid"], 403));
            }
        } else {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "workshop,Token or participant not found"], 404)
            );
        }
    }

    /**
     * action to unsubscribe a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Action to unsubscribe a Workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * @Rest\RequestParam(name="workshopId", requirements=".*", description="id of the workshop")
     * @Rest\RequestParam(name="email", requirements=".*", description="email of the participant")
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function postUnsubscribeAction(ParamFetcher $paramFetcher)
    {

        $workshopId = $paramFetcher->get("workshopId");
        $email = $paramFetcher->get("email");

        $participant = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:Participants")->findOneBy(
            ['email' => $email]
        );

        if (!$participant) {
            return $this->handleView($this->view(['code' => 404, 'message' => "UNSUBSCRIBE_NOT_ENROLLED"], 404));

        }

        $workshopParticipant = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findOneBy(['workshop' => $workshopId, 'participant' => $participant->getId()]);

        if ($workshopParticipant !== null) {
            $token = new EmailToken();
            $token->setParticipant($workshopParticipant->getParticipant());
            $this->getDoctrine()->getManager()->persist($token);
            $this->getDoctrine()->getManager()->flush();

            $url = $this->generateUrl(
                    'core_frontend_default_index',
                    [],
                    true
                ) . "#/unsubscribe/" . $workshopParticipant->getParticipant()->getId(
                ) . "/" . $workshopParticipant->getWorkshop()->getId() . "/" . $token->getToken();

            $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->findOneBy(
                ['template_name' => 'Unsubscribe']
            );
            if (!$template) {
                return $this->handleView(
                    $this->view(['code' => 404, 'message' => "UNSUBSCRIBE_EMAIL_TEMPLATE_NOT_FOUND"], 404)
                );
            }
            /* Creating Twig template from Database */
            $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
            /* Sending E-Mail with Confirmation Link*/
            $message = \Swift_Message::newInstance()
                ->setSubject(
                    $this->get('twig')->createTemplate($template->getEmailSubject())->render(
                        ["workshop" => $workshopParticipant->getWorkshop()]
                    )
                )
                ->setFrom($this->getParameter('email_sender'))
                ->setTo($workshopParticipant->getParticipant()->getEmail())
                ->setBody(
                    $renderTemplate->render(
                        [
                            "workshop"    => $workshopParticipant->getWorkshop(),
                            "participant" => $workshopParticipant->getParticipant(),
                            'url'         => $url
                        ]
                    ),
                    'text/html'
                );
            $this->get('mailer')->send($message);

            return View::create(null, Codes::HTTP_OK);

        } else {
            return $this->handleView($this->view(['code' => 404, 'message' => "UNSUBSCRIBE_NOT_ENROLLED"], 404));
        }


    }

    /**
     * action to confirme unsubscribe a
     * @ApiDoc(
     *  resource=true,
     *  description="Action to unsubscribe a Workshop",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     * @param $id int id of the workshop
     * @param $token string token to identify the user
     * @param $participantId int id of the participant
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getUnsubscribeConfirmationAction($id, $token, $participantId)
    {
        $token = $this->getDoctrine()->getManager()->getRepository("CoreEntityBundle:EmailToken")->findOneBy(
            ['token' => $token]
        );
        $workshopParticipant = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findOneBy(['workshop' => $id, 'participant' => $participantId]);

        if ($token != null && $workshopParticipant != null) {
            if ($token->getValidUntil() >= new \DateTime('now') && $token->getUsedAt() == null) {
                if ($token->getParticipant() != $workshopParticipant->getParticipant()) {
                    return $this->handleView($this->view(['code' => 403, 'message' => "User does not match"], 403));
                } else {

                    $token->setUsedAt(new \DateTime('now'));
                    // check if participant moves from waiting list to participant list
                    $this->container->get('helper')->checkParticipantList($id);
                    $this->getDoctrine()->getManager()->persist($token);
                    $this->getDoctrine()->getManager()->remove($workshopParticipant);
                    $this->getDoctrine()->getManager()->flush();
                }
            } else {
                return $this->handleView($this->view(['code' => 403, 'message' => "Token ist not valid"], 403));

            }
        } else {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "workshop,Token or participant not found"], 404)
            );
        }
    }

    /**
     * Returns the waiting list of a workshop
     * @ApiDoc(
     *  resource=true,
     *  description="Returns the waiting list of a workshop",
     *  output = {
     *      "class"="Core\EntityBundle\Entity\WorkshopParticipants",
     *      "groups"={"names"}
     *  },statusCodes = {
     *      200 = "Returned when successful",
     *      204 = "No Content in waitinglist",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshop ID"
     *      }
     *  }
     * )
     *
     * @param $id int id of workshop
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getWaitinglistAction($id)
    {
        $waitingList = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:WorkshopParticipants'
        )->findBy(['workshop' => $id, 'waiting' => true], ['enrollment' => "DESC"]);
        if (!$waitingList) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No waitinglist for workshop"], 404));
        }

        $waiting = [];
        foreach ($waitingList as $participant) {
            $waiting[] = [
                'name'    => $participant->getParticipant()->getName(),
                'surname' => $participant->getParticipant()->getSurname()
            ];
        }

        if (empty($waiting)) {
            $view = $this->view($waiting, 204);
        } else {
            $view = $this->view($waiting, 200);
        }
        return $this->handleView($view);
    }

    /**
     * Returns the list of participants
     * @ApiDoc(
     *  resource=true,
     *  description="Returns the list of participants",
     *  output = "Core\EntityBundle\Entity\WorkshopParticipants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshop ID"
     *      }
     *  }
     * )
     *
     * @param $id int id of workshop
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function getParticipantsAction($id)
    {
        $participantsList = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:WorkshopParticipants'
        )->findBy(['workshop' => $id, 'waiting' => false], ['enrollment' => "DESC"]);
        if (!$participantsList) {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "No Participant in Workshop found"], 404)
            );
        }
        $participants = [];
        foreach ($participantsList as $participant) {
            $participants[] = [
                'name'    => $participant->getParticipant()->getName(),
                'surname' => $participant->getParticipant()->getSurname()
            ];
        }

        $view = $this->view($participants, 200);
        return $this->handleView($view);
    }
}
