<?php
/**
 * Created by IntelliJ IDEA.
 * Authors: Leon Bergmann, Martin Griebel, Marco Hanisch
 * Date: 29.04.2016
 * Time: 16:44
 */
namespace Core\APIBundle\Controller\Admin;

use Doctrine\Common\Collections\Criteria;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\View\View;
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
 * Class to send E-Mails to participants
 * Class RestController.
 */
class EmailController extends FOSRestController implements ClassResourceInterface
{
    /**
     * send E-Mail to workshop participants
     * @ApiDoc(
     *  resource=true,
     *  description="Send E-Mail to workshop participants",
     *  output = "Core\EntityBundle\Entity\Participants",
     *  statusCodes = {
     *      200 = "Returned when successful",
     *      404 = "Returned when the data is not found"
     *  },requirements={
     *      {
     *          "name"="workshopId",
     *          "dataType"="integer",
     *          "requirement"="\d+",
     *          "description"="Workshop ID"
     *      }
     *  }
     * )
     * )
     * @return \Symfony\Component\HttpFoundation\Response
     * @Rest\View()
     *
     * @param $workshopId int id of a workshop
     * @param $request Request
     */
    public function postSendAction($workshopId, Request $request)
    {
        $renderTemplate = $this->get('twig')->createTemplate($request->get('content'));

        $workshopParticipants = $this->getDoctrine()->getManager()->getRepository(
            "CoreEntityBundle:WorkshopParticipants"
        )->findBy(['workshop' => $workshopId]);

        foreach ($workshopParticipants as $participant) {
            $message = \Swift_Message::newInstance()
                ->setSubject($request->get('subject'))
                ->setFrom($this->getParameter('email_sender'))
                ->setTo($participant->getParticipant()->getEmail())
                ->setBody(
                    $renderTemplate->render(['participant' => $participant, 'workshop' => $participant->getWorkshop()]),
                    'text/html'
                );
            $this->get('mailer')->send($message);
        }

    }

}
