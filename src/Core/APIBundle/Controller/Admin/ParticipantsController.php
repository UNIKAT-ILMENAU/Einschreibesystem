<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Leon Bergmann, Martin Griebel, Marco Hanisch
 * Date: 29.04.2016
 * Time: 16:44
 */
namespace Core\APIBundle\Controller\Admin;

use Core\EntityBundle\Entity\Participants;
use Core\EntityBundle\Entity\WorkshopParticipants;
use Doctrine\Common\Collections\Criteria;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Util\Codes;

use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Routing\ClassResourceInterface;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\Query;

/**
 * Class RestController.
 * this class provides the actions to get the participants and to get the blacklisted participants, to put a participant to the blacklist and to remove a participant from the blacklist
 * @Rest\RouteResource("Participants")
 */
class ParticipantsController extends FOSRestController implements ClassResourceInterface
{
    /**
     * returns list of all participants
     * @ApiDoc(
     *  resource=true,
     *  description="Returns list of all participants",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     * @return give the list of all participants
     * @Rest\View()
     */
    public function getAllAction()
    {
        $participants = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Participants')->findAll();
        if (!$participants) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No Participants found"], 404));
        }
        $view = $this->view($participants, 200);
        return $this->handleView($view);
    }

    /**
     * returns list of all participants that are blacklisted
     * @ApiDoc(
     *  resource=true,
     *  description="Returns list of all participants that are blacklisted",
     *  output = {
     *      "class"="Core\EntityBundle\Entity\WorkshopParticipants",
     *      "groups"={"names"}
     *  },statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     * )
     * @return \Symfony\Component\HttpFoundation\Response list of all participants that are blacklisted
     * @var Participants $participantsBlacklist
     * @Rest\View()
     */
    public function getBlacklistAllAction()
    {
        $participantsBlacklist = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:Participants'
        )->findBy(['blacklisted' => true]);
        if (!$participantsBlacklist) {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "No Participants on Blacklist found"], 404)
            );
        }

        foreach ($participantsBlacklist as $participant) {
            $result[] = [
                'id'               => $participant->getId(),
                'email'            => $participant->getEmail(),
                'surname'          => $participant->getSurname(),
                'name'             => $participant->getName(),
                'blacklisted_at'   => $participant->getBlacklistedAt(),
                'blacklisted_from' => $participant->getBlacklistedFrom()->getEmail()
            ];
        }

        $view = $this->view($result, 200);
        return $this->handleView($view);
    }

    /**
     * add participant to blacklist
     * @ApiDoc(
     *  resource=true,
     *  description="Add participants to blacklist ",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Participants ID"
     *      }
     * }
     * )
     * )
     *
     * @param            $id int id of the participants
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @var Participants $participant
     * @Rest\View()
     */
    public function putBlacklistAction($id)
    {
        $participant = $this->getDoctrine()->getManager()->getRepository('CoreEntityBundle:Participants')->find($id);
        if (!$participant) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No User found"], 404));
        } else {
            $participant->setBlacklisted(true);
            $participant->setBlacklistedAt(new \DateTime("now"));
            $participant->setBlacklistedFrom($this->getUser());

            $workshops = $this->getDoctrine()->getRepository("CoreEntityBundle:WorkshopParticipants")->findBy(
                ['participant' => $participant, 'participated' => false]
            );
            /* remove from all workshops*/
            foreach ($workshops as $w) {
                $this->getDoctrine()->getManager()->remove($w);
                // check if participant moves from waiting list to participant list
                $this->container->get('helper')->checkParticipantList($w->getWorkshop()->getId());
            }
            /* Load E-Mail-Template*/
            $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->findOneBy(
                ['template_name' => 'Blacklisting']
            );
            if (!$template) {
                return $this->handleView($this->view(['code' => 404, 'message' => "E-Mail Template not found"], 404));
            }
            /* Creating Twig template from Database */
            $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
            /* Send Mail */
            $message = \Swift_Message::newInstance()
                ->setSubject($template->getEmailSubject())
                ->setFrom($this->getParameter('email_sender'))
                ->setTo($participant->getEmail())
                ->setBody($renderTemplate->render(["participant" => $participant]), 'text/html');
            $this->get('mailer')->send($message);
            /* persist to database*/
            $this->getDoctrine()->getManager()->persist($participant);
            $this->getDoctrine()->getManager()->flush();

            return View::create(null, Codes::HTTP_NO_CONTENT);
        }

    }

    /**
     * remove participant from blacklist
     * @ApiDoc(
     *  resource=true,
     *  description="Remove participants from Blacklist",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Blacklist ID"
     *      }
     * }
     * )
     * )
     *
     * @param            $id int id of the participants
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @return Email that the Participants removed from Blacklist
     * @var Participants $participantsBlacklist
     * @Rest\View()
     */
    public function deleteBlacklistAction($id)
    {
        $participantsBlacklist = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:Participants"
        )->find($id);
        if (!$participantsBlacklist) {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "No Participants on Blacklist found"], 404)
            );
        }

        /* Load E-Mail-Template*/
        $template = $this->getDoctrine()->getRepository("CoreEntityBundle:EmailTemplate")->findOneBy(
            ['template_name' => 'Blacklistremoved']
        );
        if (!$template) {
            return $this->handleView($this->view(['code' => 404, 'message' => "E-Mail Template not found"], 404));
        }
        /* Creating Twig template from Database */
        $renderTemplate = $this->get('twig')->createTemplate($template->getEmailBody());
        /* Send Mail */
        $message = \Swift_Message::newInstance()
            ->setSubject($template->getEmailSubject())
            ->setFrom($this->getParameter('email_sender'))
            ->setTo($participantsBlacklist->getEmail())
            ->setBody($renderTemplate->render(["participant" => $participantsBlacklist]), 'text/html');
        $this->get('mailer')->send($message);

        $participantsBlacklist->setBlacklisted(false);
        $this->getDoctrine()->getManager()->persist($participantsBlacklist);
        $this->getDoctrine()->getManager()->flush();
        return View::create($participantsBlacklist->getEmail() . " remove from Blacklist", Codes::HTTP_OK);
    }

    /**
     * get detail view of blacklisted user
     * @ApiDoc(
     *  resource=true,
     *  description="Get detail view of blacklisted user",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="id",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Blacklist ID"
     *      }
     * }
     * )
     * )
     *
     * @param            $id int id of the participants
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @return detail view of the user that are blacklisted
     * @var Participants $participantsBlacklist
     * @Rest\View()
     */
    public function getBlacklistAction($id)
    {
        $participantsBlacklist = $this->getDoctrine()->getManager()->getRepository(
            'CoreEntityBundle:Participants'
        )->find($id);
        if (!$participantsBlacklist) {
            return $this->handleView($this->view(['code' => 404, 'message' => "No User found"], 404));
        } else {
            $view = $this->view($participantsBlacklist, 200);
            return $this->handleView($view);
        }
    }


    /**
     * delete user from participants list
     * @ApiDoc(
     *  resource=true,
     *  description="",
     *  output = "",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  }
     * )
     *
     * @param  $participant int id of participant
     * @param  $workshop int id of workshop
     *
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     */
    public function deleteRemoveAction($workshop, $participant)
    {
        $participantAtWorkshop = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findOneBy(['participant' => $participant, 'workshop' => $workshop]);
        if (!$participantAtWorkshop) {
            return $this->handleView(
                $this->view(['code' => 404, 'message' => "Participant at Workshop not found"], 404)
            );
        } else {
            // check if participant moves from waiting list to participant list
            $this->container->get('helper')->checkParticipantList($workshop);

            $this->getDoctrine()->getManager()->remove($participantAtWorkshop);
            $this->getDoctrine()->getManager()->flush();
            return $this->handleView(
                $this->view(['code' => 200, 'message' => "Remove participant from workshop"], 200)
            );

        }
    }
}


